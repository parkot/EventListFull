using EventList.Application.Templates;
using EventList.Domain.Templates;
using EventList.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EventList.Infrastructure.Templates;

public sealed class TemplateService(ApplicationDbContext dbContext) : ITemplateService
{
    private readonly ApplicationDbContext _dbContext = dbContext;

    public async Task<TemplateDto> CreateTemplateAsync(Guid ownerUserId, CreateTemplateRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new InvitationTemplate
        {
            OwnerUserId = ownerUserId,
            Name = request.Name.Trim(),
            Channel = request.Channel,
            Language = NormalizeLanguage(request.Language),
            SubjectTemplate = request.SubjectTemplate.Trim(),
            BodyTemplate = request.BodyTemplate.Trim()
        };

        _dbContext.InvitationTemplates.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Map(entity);
    }

    public async Task<IReadOnlyList<TemplateDto>> GetTemplatesAsync(Guid ownerUserId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.InvitationTemplates
            .AsNoTracking()
            .Where(x => x.OwnerUserId == ownerUserId)
            .OrderBy(x => x.Name)
            .Select(x => new TemplateDto(x.Id, x.Name, x.Channel, x.Language, x.SubjectTemplate, x.BodyTemplate, x.CreatedAtUtc))
            .ToListAsync(cancellationToken);
    }

    private static TemplateDto Map(InvitationTemplate entity) =>
        new(entity.Id, entity.Name, entity.Channel, entity.Language, entity.SubjectTemplate, entity.BodyTemplate, entity.CreatedAtUtc);

    private static string NormalizeLanguage(string value) => string.IsNullOrWhiteSpace(value) ? "en" : value.Trim().ToLowerInvariant();
}