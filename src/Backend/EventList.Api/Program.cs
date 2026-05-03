using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Json.Serialization;
using System.Net;
using System.Net.Mail;
using EventList.Application.Accounts;
using EventList.Application.Billing;
using EventList.Application.Delivery;
using EventList.Application.Events;
using EventList.Application.People;
using EventList.Application.Templates;
using EventList.Domain.Templates;
using EventList.Infrastructure;
using EventList.Infrastructure.Accounts;
using EventList.Infrastructure.Persistence;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddOpenApi();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
}
builder.Services.AddProblemDetails();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddInfrastructure(builder.Configuration);

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("JWT options are missing.");

var allowedCorsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000", "https://localhost:3000", "http://localhost:5173", "https://localhost:5173"];
var allowedCorsOriginSuffixes = builder.Configuration.GetSection("Cors:AllowedOriginSuffixes").Get<string[]>()
    ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AdminWebClient", policy =>
    {
        policy.SetIsOriginAllowed(origin => IsOriginAllowed(origin, allowedCorsOrigins, allowedCorsOriginSuffixes))
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

await app.Services.InitializeDatabaseAsync();

app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        var (statusCode, title, detail) = exception switch
        {
            InvalidOperationException invalidOperationException =>
                (StatusCodes.Status400BadRequest, "Request could not be processed.", invalidOperationException.Message),
            _ =>
                (StatusCodes.Status500InternalServerError, "An unexpected error occurred.", (string?)null)
        };

        if (exception is not null)
        {
            app.Logger.LogWarning(exception, "Request failed with status code {StatusCode}.", statusCode);
        }

        context.Response.StatusCode = statusCode;

        await Results.Problem(
            statusCode: statusCode,
            title: title,
            detail: detail).ExecuteAsync(context);
    });
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "EventList.Api v1");
    });
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("AdminWebClient");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api", (HttpContext httpContext) =>
{
    var baseUrl = $"{httpContext.Request.Scheme}://{httpContext.Request.Host}";

    return Results.Ok(new
    {
        Service = "EventList.Api",
        Status = "running",
        Endpoints = new
        {
            Health = $"{baseUrl}/api/health",
            OpenApi = app.Environment.IsDevelopment() ? $"{baseUrl}/openapi/v1.json" : null,
            SwaggerUi = app.Environment.IsDevelopment() ? $"{baseUrl}/swagger" : null
        }
    });
});

app.MapGet("/api/health", () => Results.Ok(new
{
    Status = "ok",
    Service = "EventList.Api",
    TimestampUtc = DateTimeOffset.UtcNow
}));

var auth = app.MapGroup("/api/auth");

auth.MapPost("/register", async (RegisterUserRequest request, IAccountService accountService, CancellationToken cancellationToken) =>
{
    var result = await accountService.RegisterAsync(request, cancellationToken);
    return Results.Created($"/api/users/{result.UserId}", result);
});

auth.MapPost("/login", async (LoginRequest request, IAccountService accountService, CancellationToken cancellationToken) =>
{
    var result = await accountService.LoginAsync(request, cancellationToken);
    return Results.Ok(result);
});

auth.MapPost("/refresh", async (RefreshTokenRequest request, IAccountService accountService, CancellationToken cancellationToken) =>
{
    var result = await accountService.RefreshAsync(request, cancellationToken);
    return Results.Ok(result);
});

auth.MapPost("/confirm-email", async (ConfirmEmailRequest request, IAccountService accountService, CancellationToken cancellationToken) =>
{
    await accountService.ConfirmEmailAsync(request, cancellationToken);
    return Results.Ok(new { Message = "Email confirmed." });
});

auth.MapPost("/forgot-password", async (ForgotPasswordRequest request, IAccountService accountService, CancellationToken cancellationToken) =>
{
    await accountService.RequestPasswordResetAsync(request, cancellationToken);
    return Results.Accepted();
});

auth.MapPost("/reset-password", async (ResetPasswordRequest request, IAccountService accountService, CancellationToken cancellationToken) =>
{
    await accountService.ResetPasswordAsync(request, cancellationToken);
    return Results.Ok(new { Message = "Password updated." });
});

auth.MapPost("/logout", async (ClaimsPrincipal claimsPrincipal, IAccountService accountService, CancellationToken cancellationToken) =>
{
    var userIdValue = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
    var sessionIdValue = claimsPrincipal.FindFirstValue(JwtRegisteredClaimNames.Sid);
    if (!Guid.TryParse(userIdValue, out var userId) || !Guid.TryParse(sessionIdValue, out var sessionId))
    {
        return Results.Unauthorized();
    }

    await accountService.LogoutCurrentSessionAsync(userId, sessionId, cancellationToken);
    return Results.Ok(new { Message = "Logged out from current session." });
}).RequireAuthorization();

auth.MapPost("/logout-all", async (ClaimsPrincipal claimsPrincipal, IAccountService accountService, CancellationToken cancellationToken) =>
{
    var userIdValue = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!Guid.TryParse(userIdValue, out var userId))
    {
        return Results.Unauthorized();
    }

    await accountService.LogoutAllSessionsAsync(userId, cancellationToken);
    return Results.Ok(new { Message = "Logged out from all sessions." });
}).RequireAuthorization();

app.MapGet("/api/users/me", async (ClaimsPrincipal claimsPrincipal, IAccountService accountService, CancellationToken cancellationToken) =>
{
    var userIdValue = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!Guid.TryParse(userIdValue, out var userId))
    {
        return Results.Unauthorized();
    }

    var user = await accountService.GetCurrentUserAsync(userId, cancellationToken);
    return user is null ? Results.NotFound() : Results.Ok(user);
}).RequireAuthorization();

var adminUsers = app.MapGroup("/api/admin/users")
    .RequireAuthorization(policy => policy.RequireRole("Administrator"));

var adminEmailTemplates = app.MapGroup("/api/admin/email-templates")
    .RequireAuthorization(policy => policy.RequireRole("Administrator"));

var adminEventTemplates = app.MapGroup("/api/admin/event-templates")
    .RequireAuthorization(policy => policy.RequireRole("Administrator"));

adminUsers.MapGet("/", async (IAccountService accountService, CancellationToken cancellationToken) =>
{
    var result = await accountService.GetUsersAsync(cancellationToken);
    return Results.Ok(result);
});

adminUsers.MapGet("/{userId:guid}", async (Guid userId, IAccountService accountService, CancellationToken cancellationToken) =>
{
    var result = await accountService.GetUserAsync(userId, cancellationToken);
    return result is null ? Results.NotFound() : Results.Ok(result);
});

adminUsers.MapPost("/", async (CreateUserRequest request, IAccountService accountService, CancellationToken cancellationToken) =>
{
    var result = await accountService.CreateUserAsync(request, cancellationToken);
    return Results.Created($"/api/users/{result.UserId}", result);
});

adminUsers.MapPut("/{userId:guid}", async (Guid userId, UpdateUserRequest request, IAccountService accountService, CancellationToken cancellationToken) =>
{
    var result = await accountService.UpdateUserAsync(userId, request, cancellationToken);
    return Results.Ok(result);
});

adminEmailTemplates.MapGet("/", async (IEmailTemplateService emailTemplateService, CancellationToken cancellationToken) =>
{
    var result = await emailTemplateService.GetEmailTemplatesAsync(cancellationToken);
    return Results.Ok(result);
});

adminEmailTemplates.MapPut("/", async (UpsertEmailTemplateRequest request, IEmailTemplateService emailTemplateService, CancellationToken cancellationToken) =>
{
    var result = await emailTemplateService.UpsertEmailTemplateAsync(request, cancellationToken);
    return Results.Ok(result);
});

adminEmailTemplates.MapPost("/test", async (
    SendTestEmailTemplateRequest request,
    IEmailTemplateService emailTemplateService,
    IOptions<SmtpOptions> smtpOptions,
    CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(request.ToEmail))
    {
        return Results.BadRequest(new { Message = "Recipient email is required." });
    }

    var smtp = smtpOptions.Value;
    if (string.IsNullOrWhiteSpace(smtp.Host))
    {
        return Results.BadRequest(new { Message = "SMTP host is not configured." });
    }

    var resolved = await emailTemplateService.ResolveTemplateAsync(request.Type, request.Language, cancellationToken);

    var token = "TOKEN-123456";
    var confirmationLink = string.IsNullOrWhiteSpace(smtp.ConfirmEmailBaseUrl)
        ? token
        : BuildTokenLink(smtp.ConfirmEmailBaseUrl, token);
    var resetLink = string.IsNullOrWhiteSpace(smtp.ResetPasswordBaseUrl)
        ? token
        : BuildTokenLink(smtp.ResetPasswordBaseUrl, token);

    var subject = ApplyTemplateTokens(resolved.Subject, token, confirmationLink, resetLink);
    var body = ApplyTemplateTokens(resolved.Body, token, confirmationLink, resetLink);

    using var client = new SmtpClient(smtp.Host, smtp.Port)
    {
        EnableSsl = smtp.EnableSsl,
        DeliveryMethod = SmtpDeliveryMethod.Network,
        UseDefaultCredentials = false,
        Credentials = new NetworkCredential(smtp.Username, smtp.Password)
    };

    var from = string.IsNullOrWhiteSpace(smtp.FromAddress)
        ? new MailAddress(smtp.Username)
        : new MailAddress(smtp.FromAddress, smtp.FromName);

    using var message = new MailMessage(from, new MailAddress(request.ToEmail.Trim()))
    {
        Subject = subject,
        Body = body,
        IsBodyHtml = true
    };

    await client.SendMailAsync(message, cancellationToken);
    return Results.Ok(new { Message = "Test email sent." });
});

adminEventTemplates.MapGet("/", async (IEventTemplateService eventTemplateService, CancellationToken cancellationToken) =>
{
    var result = await eventTemplateService.GetEventTemplatesAsync(cancellationToken);
    return Results.Ok(result);
});

adminEventTemplates.MapPut("/", async (UpsertEventTemplateRequest request, IEventTemplateService eventTemplateService, CancellationToken cancellationToken) =>
{
    var result = await eventTemplateService.UpsertEventTemplateAsync(request, cancellationToken);
    return Results.Ok(result);
});

var events = app.MapGroup("/api/events").RequireAuthorization();

events.MapPost("/", async (ClaimsPrincipal claimsPrincipal, CreateEventRequest request, IEventService eventService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await eventService.CreateEventAsync(userId, request, cancellationToken);
    return Results.Created($"/api/events/{result.Id}", result);
});

events.MapPut("/{eventId:guid}", async (ClaimsPrincipal claimsPrincipal, Guid eventId, CreateEventRequest request, IEventService eventService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await eventService.UpdateEventAsync(userId, eventId, request, cancellationToken);
    return Results.Ok(result);
});

events.MapGet("/", async (ClaimsPrincipal claimsPrincipal, IEventService eventService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await eventService.GetEventsAsync(userId, cancellationToken);
    return Results.Ok(result);
});

events.MapGet("/{eventId:guid}", async (ClaimsPrincipal claimsPrincipal, Guid eventId, IEventService eventService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await eventService.GetEventDetailsAsync(userId, eventId, cancellationToken);
    return result is null ? Results.NotFound() : Results.Ok(result);
});

events.MapPost("/{eventId:guid}/guests", async (ClaimsPrincipal claimsPrincipal, Guid eventId, AddGuestsRequest request, IEventService eventService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await eventService.AddGuestsAsync(userId, eventId, request, cancellationToken);
    return Results.Ok(result);
});

events.MapPost("/{eventId:guid}/seating", async (ClaimsPrincipal claimsPrincipal, Guid eventId, AssignTablesRequest request, IEventService eventService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await eventService.AssignTablesAsync(userId, eventId, request, cancellationToken);
    return Results.Ok(result);
});

events.MapPost("/{eventId:guid}/deliveries/send", async (ClaimsPrincipal claimsPrincipal, Guid eventId, SendInvitationsRequest request, IDeliveryService deliveryService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await deliveryService.SendInvitationsAsync(userId, eventId, request, cancellationToken);
    return Results.Ok(result);
});

events.MapGet("/{eventId:guid}/deliveries", async (ClaimsPrincipal claimsPrincipal, Guid eventId, IDeliveryService deliveryService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await deliveryService.GetDeliveryLogsAsync(userId, eventId, cancellationToken);
    return Results.Ok(result);
});

var invitations = app.MapGroup("/api/invitations");

invitations.MapGet("/{publicCode}", async (string publicCode, IEventService eventService, CancellationToken cancellationToken) =>
{
    var result = await eventService.GetPublicInvitationAsync(publicCode, cancellationToken);
    return result is null ? Results.NotFound() : Results.Ok(result);
});

invitations.MapPost("/{publicCode}/rsvp", async (string publicCode, SubmitRsvpRequest request, IEventService eventService, CancellationToken cancellationToken) =>
{
    var result = await eventService.RespondToInvitationAsync(publicCode, request, cancellationToken);
    return Results.Ok(result);
});

app.MapPost("/api/check-in/{scanCode}", async (string scanCode, IEventService eventService, CancellationToken cancellationToken) =>
{
    var result = await eventService.CheckInAsync(scanCode, cancellationToken);
    return Results.Ok(result);
});

var templates = app.MapGroup("/api/templates").RequireAuthorization();

var people = app.MapGroup("/api/people").RequireAuthorization();

people.MapGet("/", async (ClaimsPrincipal claimsPrincipal, IPersonService personService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await personService.GetPeopleAsync(userId, cancellationToken);
    return Results.Ok(result);
});

people.MapGet("/archived", async (ClaimsPrincipal claimsPrincipal, IPersonService personService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await personService.GetArchivedPeopleAsync(userId, cancellationToken);
    return Results.Ok(result);
});

people.MapPost("/", async (ClaimsPrincipal claimsPrincipal, CreateOrUpdatePersonRequest request, IPersonService personService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await personService.CreatePersonAsync(userId, request, cancellationToken);
    return Results.Created($"/api/people/{result.Id}", result);
});

people.MapPut("/{personId:guid}", async (ClaimsPrincipal claimsPrincipal, Guid personId, CreateOrUpdatePersonRequest request, IPersonService personService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await personService.UpdatePersonAsync(userId, personId, request, cancellationToken);
    return Results.Ok(result);
});

people.MapDelete("/{personId:guid}", async (ClaimsPrincipal claimsPrincipal, Guid personId, IPersonService personService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    await personService.DeletePersonAsync(userId, personId, cancellationToken);
    return Results.NoContent();
});

people.MapPost("/{personId:guid}/restore", async (ClaimsPrincipal claimsPrincipal, Guid personId, IPersonService personService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    try
    {
        await personService.RestorePersonAsync(userId, personId, cancellationToken);
        return Results.NoContent();
    }
    catch (InvalidOperationException exception)
    {
        return Results.BadRequest(new { Message = exception.Message });
    }
});

templates.MapPost("/", async (ClaimsPrincipal claimsPrincipal, CreateTemplateRequest request, ITemplateService templateService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await templateService.CreateTemplateAsync(userId, request, cancellationToken);
    return Results.Created($"/api/templates/{result.Id}", result);
});

templates.MapGet("/", async (ClaimsPrincipal claimsPrincipal, ITemplateService templateService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await templateService.GetTemplatesAsync(userId, cancellationToken);
    return Results.Ok(result);
});

var billing = app.MapGroup("/api/billing");

billing.MapGet("/catalog", async (IBillingService billingService, CancellationToken cancellationToken) =>
{
    var result = await billingService.GetCatalogAsync(cancellationToken);
    return Results.Ok(result);
});

billing.MapGet("/me", async (ClaimsPrincipal claimsPrincipal, IBillingService billingService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await billingService.GetMyEntitlementsAsync(userId, cancellationToken);
    return Results.Ok(result);
}).RequireAuthorization();

billing.MapPost("/checkout", async (ClaimsPrincipal claimsPrincipal, CreateCheckoutRequest request, IBillingService billingService, CancellationToken cancellationToken) =>
{
    if (!TryGetUserId(claimsPrincipal, out var userId))
    {
        return Results.Unauthorized();
    }

    var result = await billingService.CreateCheckoutAsync(userId, request, cancellationToken);
    return Results.Ok(result);
}).RequireAuthorization();

billing.MapPost("/webhooks/vivawallet", async (CompleteCheckoutRequest request, IBillingService billingService, CancellationToken cancellationToken) =>
{
    var result = await billingService.CompleteCheckoutAsync(request, cancellationToken);
    return Results.Ok(result);
});

app.Run();

static bool TryGetUserId(ClaimsPrincipal claimsPrincipal, out Guid userId)
{
    var userIdValue = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
    return Guid.TryParse(userIdValue, out userId);
}

static bool IsOriginAllowed(string origin, string[] allowedOrigins, string[] allowedOriginSuffixes)
{
    if (string.IsNullOrWhiteSpace(origin))
    {
        return false;
    }

    if (Array.Exists(allowedOrigins, allowed => string.Equals(allowed, origin, StringComparison.OrdinalIgnoreCase)))
    {
        return true;
    }

    if (!Uri.TryCreate(origin, UriKind.Absolute, out var originUri))
    {
        return false;
    }

    var host = originUri.Host;

    return Array.Exists(allowedOriginSuffixes, suffix =>
    {
        if (string.IsNullOrWhiteSpace(suffix))
        {
            return false;
        }

        var trimmedSuffix = suffix.Trim();
        return host.EndsWith(trimmedSuffix, StringComparison.OrdinalIgnoreCase)
            || string.Equals(host, trimmedSuffix.TrimStart('.'), StringComparison.OrdinalIgnoreCase);
    });
}

static string BuildTokenLink(string baseUrl, string token)
{
    var separator = baseUrl.Contains('?')
        ? baseUrl.EndsWith('?') || baseUrl.EndsWith('&')
            ? string.Empty
            : "&"
        : "?";

    return $"{baseUrl}{separator}token={Uri.EscapeDataString(token)}";
}

static string ApplyTemplateTokens(string template, string token, string confirmationLink, string resetLink)
{
    return template
        .Replace("{{Email}}", "demo@eventlist.local", StringComparison.Ordinal)
        .Replace("{{Token}}", token, StringComparison.Ordinal)
        .Replace("{{ConfirmationLink}}", confirmationLink, StringComparison.Ordinal)
        .Replace("{{ResetLink}}", resetLink, StringComparison.Ordinal)
        .Replace("{{EventTitle}}", "Spring Gala Dinner", StringComparison.Ordinal)
        .Replace("{{EventDate}}", "2026-06-15 19:30 UTC", StringComparison.Ordinal)
        .Replace("{{EventLink}}", "https://app.eventlist.local/events/demo", StringComparison.Ordinal);
}

public sealed record SendTestEmailTemplateRequest(string ToEmail, EmailTemplateType Type, string Language);

public partial class Program;
