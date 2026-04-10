using EventList.Domain.Templates;

namespace EventList.Application.Templates;

public interface ITemplateService
{
    Task<TemplateDto> CreateTemplateAsync(Guid ownerUserId, CreateTemplateRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TemplateDto>> GetTemplatesAsync(Guid ownerUserId, CancellationToken cancellationToken = default);
}

public sealed record CreateTemplateRequest(
    string Name,
    DeliveryChannel Channel,
    string Language,
    string SubjectTemplate,
    string BodyTemplate);

public sealed record TemplateDto(
    Guid Id,
    string Name,
    DeliveryChannel Channel,
    string Language,
    string SubjectTemplate,
    string BodyTemplate,
    DateTimeOffset CreatedAtUtc);