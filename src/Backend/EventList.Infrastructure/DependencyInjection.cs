using EventList.Application.Accounts;
using EventList.Application.Billing;
using EventList.Application.Delivery;
using EventList.Application.Events;
using EventList.Application.People;
using EventList.Application.Templates;
using EventList.Infrastructure.Accounts;
using EventList.Infrastructure.Billing;
using EventList.Infrastructure.Delivery;
using EventList.Infrastructure.Events;
using EventList.Infrastructure.People;
using EventList.Infrastructure.Persistence;
using EventList.Infrastructure.Templates;
using EventList.Domain.Templates;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EventList.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<BootstrapAdminOptions>(configuration.GetSection(BootstrapAdminOptions.SectionName));

        services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString));

        services.AddScoped<IPasswordHasher<EventList.Domain.Users.User>, PasswordHasher<EventList.Domain.Users.User>>();
        services.AddScoped<IAccountService, AccountService>();
        services.AddScoped<BillingService>();
        services.AddScoped<IBillingService, BillingService>();
        services.AddScoped<IDeliveryService, DeliveryService>();
        services.AddScoped<IEventService, EventService>();
        services.AddScoped<IEmailTemplateService, EmailTemplateService>();
        services.AddScoped<IPersonService, PersonService>();
        services.AddScoped<ITemplateService, TemplateService>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.Configure<SmtpOptions>(configuration.GetSection(SmtpOptions.SectionName));
        services.AddSingleton<IPaymentGateway, DevelopmentPaymentGateway>();
        services.AddSingleton<IInvitationDeliveryProvider, DevelopmentInvitationDeliveryProvider>();
        services.AddScoped<INotificationSink, SmtpNotificationSink>();

        return services;
    }

    public static async Task InitializeDatabaseAsync(this IServiceProvider services)
    {
        await using var scope = services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        if (dbContext.Database.IsRelational())
        {
            await BaselineLegacyEnsureCreatedDatabaseAsync(dbContext);
            await dbContext.Database.MigrateAsync();
        }
        else
        {
            await dbContext.Database.EnsureCreatedAsync();
        }

        var accountService = (AccountService)scope.ServiceProvider.GetRequiredService<IAccountService>();
        await accountService.EnsureBootstrapAdminAsync();
        await EnsureBillingSeedDataAsync(dbContext);
        await EnsureEmailTemplateSeedDataAsync(dbContext);
    }

    private static async Task EnsureEmailTemplateSeedDataAsync(ApplicationDbContext dbContext)
    {
        var defaults = new[]
        {
            new { Type = EmailTemplateType.UserRegistrationConfirm, Language = "en", Subject = "Confirm your email address", Body = "<p>Hello,</p><p>Please confirm your email address by clicking the link below:</p><p><a href=\"{{ConfirmationLink}}\">Confirm Email</a></p><p>This link expires in 24 hours. If you did not register, you can safely ignore this email.</p><p>- EventList</p>" },
            new { Type = EmailTemplateType.PasswordReset, Language = "en", Subject = "Reset your password", Body = "<p>Hello,</p><p>You requested a password reset. Click the link below to set a new password:</p><p><a href=\"{{ResetLink}}\">Reset Password</a></p><p>This link expires in 2 hours. If you did not request this, you can safely ignore this email.</p><p>- EventList</p>" },
            new { Type = EmailTemplateType.WelcomeMessage, Language = "en", Subject = "Welcome to EventList", Body = "<p>Hello {{Email}},</p><p>Welcome to EventList.</p><p>- EventList</p>" },
            new { Type = EmailTemplateType.InvitationReminder, Language = "en", Subject = "Reminder: your event invitation", Body = "<p>Hello {{Email}},</p><p>This is a reminder for your invitation to <strong>{{EventTitle}}</strong>.</p><p>Event date: {{EventDate}}</p><p><a href=\"{{EventLink}}\">Open event details</a></p><p>- EventList</p>" },
            new { Type = EmailTemplateType.EventUpdated, Language = "en", Subject = "Event details updated", Body = "<p>Hello {{Email}},</p><p>The event <strong>{{EventTitle}}</strong> has been updated.</p><p>Updated schedule: {{EventDate}}</p><p><a href=\"{{EventLink}}\">Review event updates</a></p><p>- EventList</p>" }
        };

        foreach (var template in defaults)
        {
            var exists = await dbContext.EmailTemplates.AnyAsync(x => x.Type == template.Type && x.Language == template.Language);
            if (exists)
            {
                continue;
            }

            dbContext.EmailTemplates.Add(new EmailTemplate
            {
                Type = template.Type,
                Language = template.Language,
                Subject = template.Subject,
                Body = template.Body
            });
        }

        await dbContext.SaveChangesAsync();
    }

    private static async Task EnsureBillingSeedDataAsync(ApplicationDbContext dbContext)
    {
        if (await dbContext.BillingPlans.AnyAsync())
        {
            return;
        }

        dbContext.BillingPlans.AddRange(
            new Domain.Billing.BillingPlan
            {
                Code = "premium-30",
                Name = "Premium 30 Days",
                Type = Domain.Billing.BillingPlanType.PremiumSubscription,
                PriceAmount = 19.99m,
                Currency = "EUR",
                PremiumDurationDays = 30
            },
            new Domain.Billing.BillingPlan
            {
                Code = "sms-100",
                Name = "SMS Pack 100",
                Type = Domain.Billing.BillingPlanType.SmsCreditPack,
                PriceAmount = 8.99m,
                Currency = "EUR",
                SmsCredits = 100
            });

        await dbContext.SaveChangesAsync();
    }

    private static async Task BaselineLegacyEnsureCreatedDatabaseAsync(ApplicationDbContext dbContext)
    {
        var allMigrations = dbContext.Database.GetMigrations();
        var appliedMigrations = await dbContext.Database.GetAppliedMigrationsAsync();

        var initialMigration = allMigrations.FirstOrDefault();
        if (initialMigration is null || appliedMigrations.Any())
        {
            return;
        }

        if (!await HasLegacySchemaAsync(dbContext))
        {
            return;
        }

        await dbContext.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'__EFMigrationsHistory', N'U') IS NULL
            BEGIN
                CREATE TABLE [__EFMigrationsHistory] (
                    [MigrationId] nvarchar(150) NOT NULL,
                    [ProductVersion] nvarchar(32) NOT NULL,
                    CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
                );
            END;
            """);

        await dbContext.Database.ExecuteSqlInterpolatedAsync(
            $"""
            IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = {initialMigration})
            BEGIN
                INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
                VALUES ({initialMigration}, {"10.0.5"});
            END;
            """);
    }

    private static async Task<bool> HasLegacySchemaAsync(ApplicationDbContext dbContext)
    {
        const string query =
            """
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME IN ('Users', 'VerificationTokens');
            """;

        var connection = dbContext.Database.GetDbConnection();
        var wasClosed = connection.State != System.Data.ConnectionState.Open;
        if (wasClosed)
        {
            await connection.OpenAsync();
        }

        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText = query;
            var result = await command.ExecuteScalarAsync();
            return result is not null && Convert.ToInt32(result) == 2;
        }
        finally
        {
            if (wasClosed)
            {
                await connection.CloseAsync();
            }
        }
    }
}