using EventList.Application.Templates;
using EventList.Domain.Templates;
using EventList.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EventList.Infrastructure.Templates;

public sealed class EmailTemplateService(ApplicationDbContext dbContext) : IEmailTemplateService
{
    private readonly ApplicationDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<EmailTemplateDto>> GetEmailTemplatesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.EmailTemplates
            .AsNoTracking()
            .OrderBy(x => x.Type)
            .ThenBy(x => x.Language)
            .Select(x => new EmailTemplateDto(x.Id, x.Type, x.Language, x.Subject, x.Body))
            .ToListAsync(cancellationToken);
    }

    public async Task<EmailTemplateDto> UpsertEmailTemplateAsync(UpsertEmailTemplateRequest request, CancellationToken cancellationToken = default)
    {
        var language = NormalizeLanguage(request.Language);
        var subject = request.Subject.Trim();
        var body = request.Body.Trim();

        var existing = await _dbContext.EmailTemplates
            .SingleOrDefaultAsync(x => x.Type == request.Type && x.Language == language, cancellationToken);

        if (existing is null)
        {
            var entity = new EmailTemplate
            {
                Type = request.Type,
                Language = language,
                Subject = subject,
                Body = body
            };

            _dbContext.EmailTemplates.Add(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return new EmailTemplateDto(entity.Id, entity.Type, entity.Language, entity.Subject, entity.Body);
        }

        existing.Subject = subject;
        existing.Body = body;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new EmailTemplateDto(existing.Id, existing.Type, existing.Language, existing.Subject, existing.Body);
    }

    public async Task<ResolvedEmailTemplate> ResolveTemplateAsync(EmailTemplateType type, string preferredLanguage, CancellationToken cancellationToken = default)
    {
        var language = NormalizeLanguage(preferredLanguage);

        var template = await _dbContext.EmailTemplates
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Type == type && x.Language == language, cancellationToken);

        if (template is null)
        {
            template = await _dbContext.EmailTemplates
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Type == type && x.Language == "en", cancellationToken);
        }

        if (template is null)
        {
            template = await _dbContext.EmailTemplates
                .AsNoTracking()
                .Where(x => x.Type == type && x.Language.StartsWith("en"))
                .OrderBy(x => x.Language)
                .FirstOrDefaultAsync(cancellationToken);
        }

        if (template is not null)
        {
            return new ResolvedEmailTemplate(template.Type, template.Language, template.Subject, template.Body);
        }

        return GetDefault(type, language);
    }

    private static ResolvedEmailTemplate GetDefault(EmailTemplateType type, string language)
    {
        return type switch
        {
            EmailTemplateType.UserRegistrationConfirm => new ResolvedEmailTemplate(
                EmailTemplateType.UserRegistrationConfirm,
                language,
                "Confirm your email address",
                "<p>Hello,</p><p>Please confirm your email address by clicking the link below:</p><p><a href=\"{{ConfirmationLink}}\">Confirm Email</a></p><p>This link expires in 24 hours. If you did not register, you can safely ignore this email.</p><p>- EventList</p>"),
            EmailTemplateType.PasswordReset => new ResolvedEmailTemplate(
                EmailTemplateType.PasswordReset,
                language,
                "Reset your password",
                "<p>Hello,</p><p>You requested a password reset. Click the link below to set a new password:</p><p><a href=\"{{ResetLink}}\">Reset Password</a></p><p>This link expires in 2 hours. If you did not request this, you can safely ignore this email.</p><p>- EventList</p>"),
            EmailTemplateType.WelcomeMessage => new ResolvedEmailTemplate(
                EmailTemplateType.WelcomeMessage,
                language,
                "Welcome to EventList",
                "<p>Hello {{Email}},</p><p>Welcome to EventList.</p><p>- EventList</p>"),
            EmailTemplateType.InvitationReminder => new ResolvedEmailTemplate(
                EmailTemplateType.InvitationReminder,
                language,
                "Reminder: your event invitation",
                "<p>Hello {{Email}},</p><p>This is a reminder for your invitation to <strong>{{EventTitle}}</strong>.</p><p>Event date: {{EventDate}}</p><p><a href=\"{{EventLink}}\">Open event details</a></p><p>- EventList</p>"),
            EmailTemplateType.EventUpdated => new ResolvedEmailTemplate(
                EmailTemplateType.EventUpdated,
                language,
                "Event details updated",
                "<p>Hello {{Email}},</p><p>The event <strong>{{EventTitle}}</strong> has been updated.</p><p>Updated schedule: {{EventDate}}</p><p><a href=\"{{EventLink}}\">Review event updates</a></p><p>- EventList</p>"),
            _ => throw new ArgumentOutOfRangeException(nameof(type), type, "Unsupported email template type.")
        };
    }

    private static string NormalizeLanguage(string value) => string.IsNullOrWhiteSpace(value) ? "en" : value.Trim().ToLowerInvariant();
}