using EventList.Domain.Templates;

namespace EventList.Application.Templates;

public interface IEmailTemplateService
{
    Task<IReadOnlyList<EmailTemplateDto>> GetEmailTemplatesAsync(CancellationToken cancellationToken = default);
    Task<EmailTemplateDto> UpsertEmailTemplateAsync(UpsertEmailTemplateRequest request, CancellationToken cancellationToken = default);
    Task<ResolvedEmailTemplate> ResolveTemplateAsync(EmailTemplateType type, string preferredLanguage, CancellationToken cancellationToken = default);
}

public sealed record UpsertEmailTemplateRequest(
    EmailTemplateType Type,
    string Language,
    string Subject,
    string Body);

public sealed record EmailTemplateDto(
    Guid Id,
    EmailTemplateType Type,
    string Language,
    string Subject,
    string Body);

public sealed record ResolvedEmailTemplate(
    EmailTemplateType Type,
    string Language,
    string Subject,
    string Body);