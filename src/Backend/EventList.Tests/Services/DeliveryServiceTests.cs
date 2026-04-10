using EventList.Application.Delivery;
using EventList.Domain.Billing;
using EventList.Domain.Delivery;
using EventList.Domain.Events;
using EventList.Domain.Templates;
using EventList.Domain.Users;
using EventList.Infrastructure.Billing;
using EventList.Infrastructure.Delivery;
using EventList.Tests.TestInfrastructure;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;

namespace EventList.Tests.Services;

public sealed class DeliveryServiceTests
{
    [Fact]
    public async Task SendInvitationsAsync_ShouldThrow_ForSmsWhenCreditsAreMissing()
    {
        await using var dbContext = TestDbContextFactory.Create();
        var (owner, eventEntity, guest, template) = await SeedSmsScenarioAsync(dbContext, smsCredits: 0);

        var billing = new BillingService(dbContext, new FakePaymentGateway(), NullLogger<BillingService>.Instance);
        var service = new DeliveryService(dbContext, new FakeDeliveryProvider(), billing, NullLogger<DeliveryService>.Instance);

        var action = async () => await service.SendInvitationsAsync(owner.Id, eventEntity.Id, new SendInvitationsRequest(template.Id, new[] { guest.Id }));

        await action.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Not enough SMS credits*");
    }

    [Fact]
    public async Task SendInvitationsAsync_ShouldConsumeSmsCredits_WhenSendSucceeds()
    {
        await using var dbContext = TestDbContextFactory.Create();
        var (owner, eventEntity, guest, template) = await SeedSmsScenarioAsync(dbContext, smsCredits: 5);

        var billing = new BillingService(dbContext, new FakePaymentGateway(), NullLogger<BillingService>.Instance);
        var service = new DeliveryService(dbContext, new FakeDeliveryProvider(), billing, NullLogger<DeliveryService>.Instance);

        var result = await service.SendInvitationsAsync(owner.Id, eventEntity.Id, new SendInvitationsRequest(template.Id, new[] { guest.Id }));
        var entitlement = dbContext.UserEntitlements.Single(x => x.UserId == owner.Id);

        result.Should().HaveCount(1);
        result[0].Status.Should().Be(DeliveryStatus.Sent);
        entitlement.SmsCreditsBalance.Should().Be(4);
    }

    private static async Task<(User owner, Event eventEntity, Guest guest, InvitationTemplate template)> SeedSmsScenarioAsync(
        EventList.Infrastructure.Persistence.ApplicationDbContext dbContext,
        int smsCredits)
    {
        var owner = new User { Email = "owner@test.local", PasswordHash = "hash", EmailConfirmed = true };
        var eventEntity = new Event
        {
            OwnerUser = owner,
            OwnerUserId = owner.Id,
            Title = "Event",
            OccasionType = "Wedding",
            ScheduledAtUtc = DateTimeOffset.UtcNow.AddDays(5),
            Venue = "Venue",
            Address = "Address",
            TimeZone = "UTC",
            DefaultLanguage = "en"
        };

        var guest = new Guest
        {
            Event = eventEntity,
            EventId = eventEntity.Id,
            FullName = "Guest",
            Email = "guest@test.local",
            PhoneNumber = "+3000001",
            PreferredLanguage = "en"
        };

        var invitation = new Invitation
        {
            Event = eventEntity,
            EventId = eventEntity.Id,
            Guest = guest,
            GuestId = guest.Id,
            PublicCode = "PUB-SMS-1",
            ScanCode = "SCAN-SMS-1"
        };
        guest.Invitation = invitation;

        var template = new InvitationTemplate
        {
            OwnerUser = owner,
            OwnerUserId = owner.Id,
            Name = "Sms template",
            Channel = DeliveryChannel.Sms,
            Language = "en",
            SubjectTemplate = "SMS",
            BodyTemplate = "Hello {{GuestName}}"
        };

        var entitlement = new UserEntitlement
        {
            User = owner,
            UserId = owner.Id,
            SmsCreditsBalance = smsCredits
        };

        dbContext.Users.Add(owner);
        dbContext.Events.Add(eventEntity);
        dbContext.Guests.Add(guest);
        dbContext.Invitations.Add(invitation);
        dbContext.InvitationTemplates.Add(template);
        dbContext.UserEntitlements.Add(entitlement);
        await dbContext.SaveChangesAsync();

        return (owner, eventEntity, guest, template);
    }

    private sealed class FakePaymentGateway : EventList.Application.Billing.IPaymentGateway
    {
        public Task<EventList.Application.Billing.PaymentCheckoutSession> CreateCheckoutAsync(EventList.Application.Billing.PaymentCheckoutRequest request, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new EventList.Application.Billing.PaymentCheckoutSession($"fake_{request.TransactionId:N}", $"https://fake-pay/{request.TransactionId:N}"));
        }
    }

    private sealed class FakeDeliveryProvider : IInvitationDeliveryProvider
    {
        public Task<DeliveryProviderResult> SendAsync(DeliveryMessage message, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new DeliveryProviderResult(true, Guid.NewGuid().ToString("N"), string.Empty));
        }
    }
}