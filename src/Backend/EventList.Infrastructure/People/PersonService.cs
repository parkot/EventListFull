using EventList.Application.People;
using EventList.Domain.People;
using EventList.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EventList.Infrastructure.People;

public sealed class PersonService(ApplicationDbContext dbContext) : IPersonService
{
    private readonly ApplicationDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<PersonDto>> GetPeopleAsync(Guid ownerUserId, CancellationToken cancellationToken = default)
    {
        await SyncGuestsToPeopleAsync(ownerUserId, cancellationToken);

        return await _dbContext.People
            .AsNoTracking()
            .Where(x => x.OwnerUserId == ownerUserId && !x.IsArchived)
            .OrderBy(x => x.FullName)
            .Select(x => new PersonDto(
                x.Id,
                x.FullName,
                x.Email,
                x.PhoneNumber,
                x.Availability,
                x.CreatedAtUtc,
                x.UpdatedAtUtc,
                x.ArchivedAtUtc))
            .ToListAsync(cancellationToken);
    }

    private async Task SyncGuestsToPeopleAsync(Guid ownerUserId, CancellationToken cancellationToken)
    {
        var knownEmails = await _dbContext.People
            .AsNoTracking()
            .Where(x => x.OwnerUserId == ownerUserId)
            .Select(x => x.Email)
            .ToHashSetAsync(cancellationToken);

        var guestRows = await _dbContext.Guests
            .AsNoTracking()
            .Where(x => x.Event != null && x.Event.OwnerUserId == ownerUserId)
            .Select(x => new
            {
                x.FullName,
                x.Email,
                x.PhoneNumber
            })
            .ToListAsync(cancellationToken);

        var guestsByEmail = guestRows
            .Select(x => new
            {
                FullName = x.FullName?.Trim() ?? string.Empty,
                Email = x.Email?.Trim().ToLowerInvariant() ?? string.Empty,
                PhoneNumber = x.PhoneNumber?.Trim() ?? string.Empty
            })
            .Where(x => !string.IsNullOrWhiteSpace(x.Email))
            .GroupBy(x => x.Email)
            .Select(x => x.First())
            .ToList();

        var now = DateTimeOffset.UtcNow;
        var hasChanges = false;

        foreach (var guest in guestsByEmail)
        {
            // If a person exists with this email (active or archived), do not recreate it from guests.
            if (knownEmails.Contains(guest.Email))
            {
                continue;
            }

            _dbContext.People.Add(new Person
            {
                OwnerUserId = ownerUserId,
                FullName = string.IsNullOrWhiteSpace(guest.FullName) ? "Unnamed" : guest.FullName,
                Email = guest.Email,
                PhoneNumber = guest.PhoneNumber,
                Availability = "Not set",
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            });

            knownEmails.Add(guest.Email);
            hasChanges = true;
        }

        if (hasChanges)
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<IReadOnlyList<PersonDto>> GetArchivedPeopleAsync(Guid ownerUserId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.People
            .AsNoTracking()
            .Where(x => x.OwnerUserId == ownerUserId && x.IsArchived)
            .OrderBy(x => x.FullName)
            .Select(x => new PersonDto(
                x.Id,
                x.FullName,
                x.Email,
                x.PhoneNumber,
                x.Availability,
                x.CreatedAtUtc,
                x.UpdatedAtUtc,
                x.ArchivedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task<PersonDto> CreatePersonAsync(Guid ownerUserId, CreateOrUpdatePersonRequest request, CancellationToken cancellationToken = default)
    {
        var fullName = request.FullName.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        var duplicate = await _dbContext.People
            .AnyAsync(x => x.OwnerUserId == ownerUserId && x.Email == email && !x.IsArchived, cancellationToken);

        if (duplicate)
        {
            throw new InvalidOperationException("A person with this email already exists.");
        }

        var now = DateTimeOffset.UtcNow;
        var entity = new Person
        {
            OwnerUserId = ownerUserId,
            FullName = fullName,
            Email = email,
            PhoneNumber = request.PhoneNumber.Trim(),
            Availability = NormalizeAvailability(request.Availability),
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _dbContext.People.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapPerson(entity);
    }

    public async Task<PersonDto> UpdatePersonAsync(Guid ownerUserId, Guid personId, CreateOrUpdatePersonRequest request, CancellationToken cancellationToken = default)
    {
        var fullName = request.FullName.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        var entity = await _dbContext.People
            .SingleOrDefaultAsync(x => x.OwnerUserId == ownerUserId && x.Id == personId && !x.IsArchived, cancellationToken)
            ?? throw new InvalidOperationException("Person was not found.");

        var duplicate = await _dbContext.People
            .AnyAsync(x => x.OwnerUserId == ownerUserId && x.Id != personId && x.Email == email && !x.IsArchived, cancellationToken);

        if (duplicate)
        {
            throw new InvalidOperationException("A person with this email already exists.");
        }

        entity.FullName = fullName;
        entity.Email = email;
        entity.PhoneNumber = request.PhoneNumber.Trim();
        entity.Availability = NormalizeAvailability(request.Availability);
        entity.UpdatedAtUtc = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapPerson(entity);
    }

    public async Task DeletePersonAsync(Guid ownerUserId, Guid personId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.People
            .SingleOrDefaultAsync(x => x.OwnerUserId == ownerUserId && x.Id == personId && !x.IsArchived, cancellationToken)
            ?? throw new InvalidOperationException("Person was not found.");

        entity.IsArchived = true;
        entity.ArchivedAtUtc = DateTimeOffset.UtcNow;
        entity.UpdatedAtUtc = DateTimeOffset.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RestorePersonAsync(Guid ownerUserId, Guid personId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.People
            .SingleOrDefaultAsync(x => x.OwnerUserId == ownerUserId && x.Id == personId && x.IsArchived, cancellationToken)
            ?? throw new InvalidOperationException("Person was not found.");

        var duplicate = await _dbContext.People
            .AnyAsync(x => x.OwnerUserId == ownerUserId && x.Id != personId && x.Email == entity.Email && !x.IsArchived, cancellationToken);

        if (duplicate)
        {
            // Replace active duplicate with the archived record being restored.
            var activeDuplicate = await _dbContext.People
                .SingleAsync(x => x.OwnerUserId == ownerUserId && x.Id != personId && x.Email == entity.Email && !x.IsArchived, cancellationToken);

            var now = DateTimeOffset.UtcNow;
            activeDuplicate.IsArchived = true;
            activeDuplicate.ArchivedAtUtc = now;
            activeDuplicate.UpdatedAtUtc = now;
        }

        entity.IsArchived = false;
        entity.ArchivedAtUtc = null;
        entity.UpdatedAtUtc = DateTimeOffset.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static string NormalizeAvailability(string value)
    {
        var availability = value.Trim();
        return string.IsNullOrWhiteSpace(availability) ? "Not set" : availability;
    }

    private static PersonDto MapPerson(Person entity)
    {
        return new PersonDto(
            entity.Id,
            entity.FullName,
            entity.Email,
            entity.PhoneNumber,
            entity.Availability,
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc,
            entity.ArchivedAtUtc);
    }
}
