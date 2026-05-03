namespace EventList.Application.Templates;

public interface IEventTemplateService
{
    Task<IReadOnlyList<EventTemplateDto>> GetEventTemplatesAsync(CancellationToken cancellationToken = default);
    Task<EventTemplateDto> UpsertEventTemplateAsync(UpsertEventTemplateRequest request, CancellationToken cancellationToken = default);
}

public sealed record UpsertEventTemplateRequest(
    string Name,
    string Language,
    string Body);

public sealed record EventTemplateDto(
    Guid Id,
    string Name,
    string Language,
    string Body,
    DateTimeOffset CreatedAtUtc);