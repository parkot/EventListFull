using EventList.Application.Events;
using EventList.Domain.Events;
using EventList.Domain.Users;
using EventList.Infrastructure.Events;
using EventList.Tests.TestInfrastructure;
using FluentAssertions;

namespace EventList.Tests.Services;

public sealed class EventServiceTests
{
    [Fact]
    public async Task AssignTablesAsync_ShouldThrow_WhenGuestIsNotAttending()
    {
        await using var dbContext = TestDbContextFactory.Create();
        var owner = new User { Email = "owner@test.local", PasswordHash = "hash", EmailConfirmed = true };
        var eventEntity = new Event
        {
            OwnerUserId = owner.Id,
            OwnerUser = owner,
            Title = "Event",
            OccasionType = "Wedding",
            Venue = "Hall",
            Address = "Address",
            ScheduledAtUtc = DateTimeOffset.UtcNow.AddDays(10),
            TimeZone = "UTC",
            DefaultLanguage = "en"
        };
        var guest = new Guest
        {
            Event = eventEntity,
            EventId = eventEntity.Id,
            FullName = "Guest",
            Email = "guest@test.local",
            PhoneNumber = "+100000",
            PreferredLanguage = "en",
            RsvpStatus = RsvpStatus.Pending
        };
        var invitation = new Invitation { Event = eventEntity, EventId = eventEntity.Id, Guest = guest, GuestId = guest.Id, PublicCode = "PUB1", ScanCode = "SCAN1" };
        guest.Invitation = invitation;

        dbContext.Users.Add(owner);
        dbContext.Events.Add(eventEntity);
        dbContext.Guests.Add(guest);
        dbContext.Invitations.Add(invitation);
        await dbContext.SaveChangesAsync();

        var service = new EventService(dbContext);

        var action = async () => await service.AssignTablesAsync(owner.Id, eventEntity.Id, new AssignTablesRequest(new[]
        {
            new AssignTableRequest(guest.Id, 4)
        }));

        await action.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*must have RSVP status Attending*");
    }

    [Fact]
    public async Task CheckInAsync_ShouldBeIdempotent_AndReturnTable()
    {
        await using var dbContext = TestDbContextFactory.Create();
        var owner = new User { Email = "owner@test.local", PasswordHash = "hash", EmailConfirmed = true };
        var eventEntity = new Event
        {
            OwnerUserId = owner.Id,
            OwnerUser = owner,
            Title = "Event",
            OccasionType = "Wedding",
            Venue = "Hall",
            Address = "Address",
            ScheduledAtUtc = DateTimeOffset.UtcNow.AddDays(10),
            TimeZone = "UTC",
            DefaultLanguage = "en"
        };
        var guest = new Guest
        {
            Event = eventEntity,
            EventId = eventEntity.Id,
            FullName = "Guest",
            Email = "guest@test.local",
            PhoneNumber = "+100000",
            PreferredLanguage = "en",
            RsvpStatus = RsvpStatus.Attending,
            TableNumber = 9
        };
        var invitation = new Invitation { Event = eventEntity, EventId = eventEntity.Id, Guest = guest, GuestId = guest.Id, PublicCode = "PUB2", ScanCode = "SCAN2" };
        guest.Invitation = invitation;

        dbContext.Users.Add(owner);
        dbContext.Events.Add(eventEntity);
        dbContext.Guests.Add(guest);
        dbContext.Invitations.Add(invitation);
        await dbContext.SaveChangesAsync();

        var service = new EventService(dbContext);

        var first = await service.CheckInAsync("SCAN2");
        var second = await service.CheckInAsync("SCAN2");

        first.AlreadyCheckedIn.Should().BeFalse();
        second.AlreadyCheckedIn.Should().BeTrue();
        first.TableNumber.Should().Be(9);
        second.TableNumber.Should().Be(9);
    }
}