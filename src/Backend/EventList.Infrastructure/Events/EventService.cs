using System.Security.Cryptography;
using EventList.Application.Events;
using EventList.Domain.Events;
using EventList.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EventList.Infrastructure.Events;

public sealed class EventService(ApplicationDbContext dbContext) : IEventService
{
    private readonly ApplicationDbContext _dbContext = dbContext;

    public async Task<EventSummaryDto> CreateEventAsync(Guid ownerUserId, CreateEventRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new Event
        {
            OwnerUserId = ownerUserId,
            Title = request.Title.Trim(),
            OccasionType = request.OccasionType.Trim(),
            ScheduledAtUtc = request.ScheduledAtUtc,
            Venue = request.Venue.Trim(),
            Address = request.Address.Trim(),
            TimeZone = NormalizeTimeZone(request.TimeZone),
            DefaultLanguage = NormalizeLanguage(request.DefaultLanguage)
        };

        _dbContext.Events.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new EventSummaryDto(entity.Id, entity.Title, entity.OccasionType, entity.ScheduledAtUtc, entity.Venue, EmptyStats());
    }

    public async Task<IReadOnlyList<EventSummaryDto>> GetEventsAsync(Guid ownerUserId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Events
            .AsNoTracking()
            .Where(x => x.OwnerUserId == ownerUserId)
            .Select(x => new EventSummaryDto(
                x.Id,
                x.Title,
                x.OccasionType,
                x.ScheduledAtUtc,
                x.Venue,
                BuildStats(x.Guests)))
            .OrderBy(x => x.ScheduledAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<EventDetailsDto?> GetEventDetailsAsync(Guid ownerUserId, Guid eventId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Events
            .AsNoTracking()
            .Include(x => x.Guests)
                .ThenInclude(x => x.Invitation)
            .SingleOrDefaultAsync(x => x.OwnerUserId == ownerUserId && x.Id == eventId, cancellationToken);

        if (entity is null)
        {
            return null;
        }

        return new EventDetailsDto(
            entity.Id,
            entity.Title,
            entity.OccasionType,
            entity.ScheduledAtUtc,
            entity.Venue,
            entity.Address,
            entity.TimeZone,
            entity.DefaultLanguage,
            BuildStats(entity.Guests),
            entity.Guests
                .OrderBy(x => x.FullName)
                .Select(MapGuest)
                .ToList());
    }

    public async Task<IReadOnlyList<GuestInvitationDto>> AddGuestsAsync(Guid ownerUserId, Guid eventId, AddGuestsRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Events
            .Include(x => x.Guests)
                .ThenInclude(x => x.Invitation)
            .SingleOrDefaultAsync(x => x.OwnerUserId == ownerUserId && x.Id == eventId, cancellationToken)
            ?? throw new InvalidOperationException("Event was not found.");

        var guests = new List<GuestInvitationDto>();
        foreach (var guestRequest in request.Guests)
        {
            var guest = new Guest
            {
                EventId = entity.Id,
                FullName = guestRequest.FullName.Trim(),
                Email = guestRequest.Email.Trim(),
                PhoneNumber = guestRequest.PhoneNumber.Trim(),
                PreferredLanguage = NormalizeLanguage(string.IsNullOrWhiteSpace(guestRequest.PreferredLanguage) ? entity.DefaultLanguage : guestRequest.PreferredLanguage)
            };

            var invitation = new Invitation
            {
                EventId = entity.Id,
                Guest = guest,
                PublicCode = GeneratePublicCode(),
                ScanCode = GeneratePublicCode()
            };

            _dbContext.Guests.Add(guest);
            _dbContext.Invitations.Add(invitation);
            guest.Invitation = invitation;
            entity.Guests.Add(guest);
            guests.Add(MapGuest(guest));
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return guests;
    }

    public async Task<IReadOnlyList<GuestInvitationDto>> AssignTablesAsync(Guid ownerUserId, Guid eventId, AssignTablesRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Events
            .Include(x => x.Guests)
                .ThenInclude(x => x.Invitation)
            .SingleOrDefaultAsync(x => x.OwnerUserId == ownerUserId && x.Id == eventId, cancellationToken)
            ?? throw new InvalidOperationException("Event was not found.");

        var guestsById = entity.Guests.ToDictionary(x => x.Id);
        foreach (var assignment in request.Assignments)
        {
            if (!guestsById.TryGetValue(assignment.GuestId, out var guest))
            {
                throw new InvalidOperationException($"Guest {assignment.GuestId} was not found in this event.");
            }

            if (guest.RsvpStatus != RsvpStatus.Attending)
            {
                throw new InvalidOperationException($"Guest '{guest.FullName}' must have RSVP status Attending before table assignment.");
            }

            if (assignment.TableNumber <= 0)
            {
                throw new InvalidOperationException("Table number must be greater than zero.");
            }

            guest.TableNumber = assignment.TableNumber;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity.Guests.OrderBy(x => x.FullName).Select(MapGuest).ToList();
    }

    public async Task<PublicInvitationDto?> GetPublicInvitationAsync(string publicCode, CancellationToken cancellationToken = default)
    {
        var invitation = await _dbContext.Invitations
            .Include(x => x.Event)
            .Include(x => x.Guest)
            .SingleOrDefaultAsync(x => x.PublicCode == publicCode, cancellationToken);

        if (invitation is null)
        {
            return null;
        }

        invitation.LastViewedAtUtc = DateTimeOffset.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapPublicInvitation(invitation);
    }

    public async Task<PublicInvitationDto> RespondToInvitationAsync(string publicCode, SubmitRsvpRequest request, CancellationToken cancellationToken = default)
    {
        var invitation = await _dbContext.Invitations
            .Include(x => x.Event)
            .Include(x => x.Guest)
            .SingleOrDefaultAsync(x => x.PublicCode == publicCode, cancellationToken)
            ?? throw new InvalidOperationException("Invitation was not found.");

        invitation.LastViewedAtUtc = DateTimeOffset.UtcNow;
        invitation.Guest!.RsvpStatus = request.Status;
        invitation.Guest.RespondedAtUtc = DateTimeOffset.UtcNow;
        if (request.Status != RsvpStatus.Attending)
        {
            invitation.Guest.TableNumber = null;
        }
        await _dbContext.SaveChangesAsync(cancellationToken);

        return MapPublicInvitation(invitation);
    }

    public async Task<CheckInResultDto> CheckInAsync(string scanCode, CancellationToken cancellationToken = default)
    {
        var invitation = await _dbContext.Invitations
            .Include(x => x.Event)
            .Include(x => x.Guest)
            .SingleOrDefaultAsync(x => x.ScanCode == scanCode, cancellationToken)
            ?? throw new InvalidOperationException("Invitation scan code was not found.");

        var guest = invitation.Guest!;
        if (guest.RsvpStatus != RsvpStatus.Attending)
        {
            throw new InvalidOperationException("Only guests with RSVP status Attending can be checked in.");
        }

        var alreadyCheckedIn = guest.CheckedInAtUtc is not null;
        guest.CheckedInAtUtc ??= DateTimeOffset.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new CheckInResultDto(
            invitation.Event!.Id,
            invitation.Event.Title,
            guest.FullName,
            guest.TableNumber,
            guest.RsvpStatus,
            alreadyCheckedIn,
            guest.CheckedInAtUtc.Value);
    }

    private static GuestInvitationDto MapGuest(Guest guest)
    {
        return new GuestInvitationDto(
            guest.Id,
            guest.FullName,
            guest.Email,
            guest.PhoneNumber,
            guest.PreferredLanguage,
            guest.RsvpStatus,
            guest.TableNumber,
                guest.CheckedInAtUtc,
                guest.Invitation?.PublicCode ?? string.Empty,
                guest.Invitation?.ScanCode ?? string.Empty);
    }

    private static PublicInvitationDto MapPublicInvitation(Invitation invitation)
    {
        return new PublicInvitationDto(
            invitation.Event!.Id,
            invitation.Event.Title,
            invitation.Event.OccasionType,
            invitation.Event.ScheduledAtUtc,
            invitation.Event.Venue,
            invitation.Event.Address,
            invitation.Guest!.FullName,
            invitation.Guest.PreferredLanguage,
            invitation.Guest.RsvpStatus,
            invitation.Guest.TableNumber,
                invitation.Guest.CheckedInAtUtc,
                invitation.PublicCode,
                invitation.ScanCode);
    }

    private static EventStatsDto BuildStats(IEnumerable<Guest> guests)
    {
        var guestList = guests.ToList();
        return new EventStatsDto(
            guestList.Count,
            guestList.Count(x => x.RsvpStatus == RsvpStatus.Pending),
            guestList.Count(x => x.RsvpStatus == RsvpStatus.Attending),
            guestList.Count(x => x.RsvpStatus == RsvpStatus.Declined),
            guestList.Count(x => x.RsvpStatus == RsvpStatus.Maybe),
            guestList.Count(x => x.CheckedInAtUtc is not null));
    }

    private static EventStatsDto EmptyStats() => new(0, 0, 0, 0, 0, 0);

    private static string NormalizeLanguage(string value) => string.IsNullOrWhiteSpace(value) ? "en" : value.Trim().ToLowerInvariant();

    private static string NormalizeTimeZone(string value) => string.IsNullOrWhiteSpace(value) ? "UTC" : value.Trim();

    private static string GeneratePublicCode() => Convert.ToHexString(RandomNumberGenerator.GetBytes(12));
}