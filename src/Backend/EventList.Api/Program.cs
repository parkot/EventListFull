using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Json.Serialization;
using EventList.Application.Accounts;
using EventList.Application.Billing;
using EventList.Application.Delivery;
using EventList.Application.Events;
using EventList.Application.Templates;
using EventList.Infrastructure;
using EventList.Infrastructure.Accounts;
using EventList.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddInfrastructure(builder.Configuration);

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("JWT options are missing.");

var allowedCorsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000", "https://localhost:3000", "http://localhost:5173", "https://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AdminWebClient", policy =>
    {
        policy.WithOrigins(allowedCorsOrigins)
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

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AdminWebClient");
app.UseAuthentication();
app.UseAuthorization();

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

app.MapPost("/api/admin/users", async (CreateUserRequest request, IAccountService accountService, CancellationToken cancellationToken) =>
{
    var result = await accountService.CreateUserAsync(request, cancellationToken);
    return Results.Created($"/api/users/{result.UserId}", result);
}).RequireAuthorization(policy => policy.RequireRole("Administrator"));

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

public partial class Program;
