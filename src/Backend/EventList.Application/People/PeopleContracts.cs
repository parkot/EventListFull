namespace EventList.Application.People;

public interface IPersonService
{
    Task<IReadOnlyList<PersonDto>> GetPeopleAsync(Guid ownerUserId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PersonDto>> GetArchivedPeopleAsync(Guid ownerUserId, CancellationToken cancellationToken = default);
    Task<PersonDto> CreatePersonAsync(Guid ownerUserId, CreateOrUpdatePersonRequest request, CancellationToken cancellationToken = default);
    Task<PersonDto> UpdatePersonAsync(Guid ownerUserId, Guid personId, CreateOrUpdatePersonRequest request, CancellationToken cancellationToken = default);
    Task DeletePersonAsync(Guid ownerUserId, Guid personId, CancellationToken cancellationToken = default);
    Task RestorePersonAsync(Guid ownerUserId, Guid personId, CancellationToken cancellationToken = default);
}

public sealed record CreateOrUpdatePersonRequest(
    string FullName,
    string Email,
    string PhoneNumber,
    string Availability);

public sealed record PersonDto(
    Guid Id,
    string FullName,
    string Email,
    string PhoneNumber,
    string Availability,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    DateTimeOffset? ArchivedAtUtc = null);
