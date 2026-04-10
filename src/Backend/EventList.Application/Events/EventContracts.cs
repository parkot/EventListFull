using EventList.Domain.Events;

namespace EventList.Application.Events;

public interface IEventService
{
    Task<EventSummaryDto> CreateEventAsync(Guid ownerUserId, CreateEventRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EventSummaryDto>> GetEventsAsync(Guid ownerUserId, CancellationToken cancellationToken = default);
    Task<EventDetailsDto?> GetEventDetailsAsync(Guid ownerUserId, Guid eventId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<GuestInvitationDto>> AddGuestsAsync(Guid ownerUserId, Guid eventId, AddGuestsRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<GuestInvitationDto>> AssignTablesAsync(Guid ownerUserId, Guid eventId, AssignTablesRequest request, CancellationToken cancellationToken = default);
    Task<PublicInvitationDto?> GetPublicInvitationAsync(string publicCode, CancellationToken cancellationToken = default);
    Task<PublicInvitationDto> RespondToInvitationAsync(string publicCode, SubmitRsvpRequest request, CancellationToken cancellationToken = default);
    Task<CheckInResultDto> CheckInAsync(string scanCode, CancellationToken cancellationToken = default);
}

public sealed record CreateEventRequest(
    string Title,
    string OccasionType,
    DateTimeOffset ScheduledAtUtc,
    string Venue,
    string Address,
    string TimeZone,
    string DefaultLanguage);

public sealed record AddGuestsRequest(IReadOnlyList<CreateGuestRequest> Guests);

public sealed record CreateGuestRequest(string FullName, string Email, string PhoneNumber, string PreferredLanguage);

public sealed record AssignTablesRequest(IReadOnlyList<AssignTableRequest> Assignments);

public sealed record AssignTableRequest(Guid GuestId, int TableNumber);

public sealed record SubmitRsvpRequest(RsvpStatus Status);

public sealed record EventSummaryDto(Guid Id, string Title, string OccasionType, DateTimeOffset ScheduledAtUtc, string Venue, EventStatsDto Stats);

public sealed record EventDetailsDto(
    Guid Id,
    string Title,
    string OccasionType,
    DateTimeOffset ScheduledAtUtc,
    string Venue,
    string Address,
    string TimeZone,
    string DefaultLanguage,
    EventStatsDto Stats,
    IReadOnlyList<GuestInvitationDto> Guests);

public sealed record EventStatsDto(int TotalGuests, int Pending, int Attending, int Declined, int Maybe, int CheckedIn);

public sealed record GuestInvitationDto(
    Guid GuestId,
    string FullName,
    string Email,
    string PhoneNumber,
    string PreferredLanguage,
    RsvpStatus RsvpStatus,
    int? TableNumber,
    DateTimeOffset? CheckedInAtUtc,
    string InvitationCode,
    string ScanCode);

public sealed record PublicInvitationDto(
    Guid EventId,
    string EventTitle,
    string OccasionType,
    DateTimeOffset ScheduledAtUtc,
    string Venue,
    string Address,
    string GuestName,
    string PreferredLanguage,
    RsvpStatus RsvpStatus,
    int? TableNumber,
    DateTimeOffset? CheckedInAtUtc,
    string InvitationCode,
    string ScanCode);

public sealed record CheckInResultDto(
    Guid EventId,
    string EventTitle,
    string GuestName,
    int? TableNumber,
    RsvpStatus RsvpStatus,
    bool AlreadyCheckedIn,
    DateTimeOffset CheckedInAtUtc);