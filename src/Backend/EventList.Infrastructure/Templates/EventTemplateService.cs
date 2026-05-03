using EventList.Application.Templates;
using EventList.Domain.Templates;
using EventList.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EventList.Infrastructure.Templates;

public sealed class EventTemplateService(ApplicationDbContext dbContext) : IEventTemplateService
{
    private readonly ApplicationDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<EventTemplateDto>> GetEventTemplatesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.EventTemplates
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ThenBy(x => x.Language)
            .Select(x => new EventTemplateDto(x.Id, x.Name, x.Language, x.Body, x.CreatedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task<EventTemplateDto> UpsertEventTemplateAsync(UpsertEventTemplateRequest request, CancellationToken cancellationToken = default)
    {
        var name = request.Name.Trim();
        var language = NormalizeLanguage(request.Language);
        var body = request.Body.Trim();
        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(body))
        {
            throw new InvalidOperationException("Name and body are required.");
        }

        var existing = await _dbContext.EventTemplates
            .SingleOrDefaultAsync(x => x.Name == name && x.Language == language, cancellationToken);

        if (existing is null)
        {
            var entity = new EventTemplate
            {
                Name = name,
                Language = language,
                Body = body
            };

            _dbContext.EventTemplates.Add(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return new EventTemplateDto(entity.Id, entity.Name, entity.Language, entity.Body, entity.CreatedAtUtc);
        }

        existing.Body = body;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new EventTemplateDto(existing.Id, existing.Name, existing.Language, existing.Body, existing.CreatedAtUtc);
    }

    private static string NormalizeLanguage(string value) => string.IsNullOrWhiteSpace(value) ? "en" : value.Trim().ToLowerInvariant();
}