using EventList.Application.Billing;
using EventList.Domain.Billing;
using EventList.Domain.Users;
using EventList.Infrastructure.Billing;
using EventList.Tests.TestInfrastructure;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;

namespace EventList.Tests.Services;

public sealed class BillingServiceTests
{
    [Fact]
    public async Task CompleteCheckoutAsync_ShouldApplySmsCredits()
    {
        await using var dbContext = TestDbContextFactory.Create();

        var user = new User { Email = "buyer@test.local", PasswordHash = "hash", EmailConfirmed = true, Role = AccountRole.FreeUser };
        var plan = new BillingPlan
        {
            Code = "sms-100",
            Name = "SMS 100",
            Type = BillingPlanType.SmsCreditPack,
            PriceAmount = 8.99m,
            Currency = "EUR",
            SmsCredits = 100,
            IsActive = true
        };

        dbContext.Users.Add(user);
        dbContext.BillingPlans.Add(plan);
        await dbContext.SaveChangesAsync();

        var paymentGateway = new FakePaymentGateway();
        var service = new BillingService(dbContext, paymentGateway, NullLogger<BillingService>.Instance);

        var checkout = await service.CreateCheckoutAsync(user.Id, new CreateCheckoutRequest(plan.Id));
        var completed = await service.CompleteCheckoutAsync(new CompleteCheckoutRequest(checkout.ExternalPaymentId));
        var entitlements = await service.GetMyEntitlementsAsync(user.Id);

        completed.Status.Should().Be(BillingTransactionStatus.Completed);
        entitlements.SmsCreditsBalance.Should().Be(100);
        entitlements.HasPremiumAccess.Should().BeFalse();
    }

    [Fact]
    public async Task CompleteCheckoutAsync_ShouldPromoteUserToPremium()
    {
        await using var dbContext = TestDbContextFactory.Create();

        var user = new User { Email = "premium@test.local", PasswordHash = "hash", EmailConfirmed = true, Role = AccountRole.FreeUser };
        var plan = new BillingPlan
        {
            Code = "premium-30",
            Name = "Premium 30",
            Type = BillingPlanType.PremiumSubscription,
            PriceAmount = 19.99m,
            Currency = "EUR",
            PremiumDurationDays = 30,
            IsActive = true
        };

        dbContext.Users.Add(user);
        dbContext.BillingPlans.Add(plan);
        await dbContext.SaveChangesAsync();

        var paymentGateway = new FakePaymentGateway();
        var service = new BillingService(dbContext, paymentGateway, NullLogger<BillingService>.Instance);

        var checkout = await service.CreateCheckoutAsync(user.Id, new CreateCheckoutRequest(plan.Id));
        await service.CompleteCheckoutAsync(new CompleteCheckoutRequest(checkout.ExternalPaymentId));

        var refreshedUser = await dbContext.Users.FindAsync(user.Id);
        var entitlements = await service.GetMyEntitlementsAsync(user.Id);

        refreshedUser!.Role.Should().Be(AccountRole.PremiumUser);
        entitlements.HasPremiumAccess.Should().BeTrue();
    }

    private sealed class FakePaymentGateway : IPaymentGateway
    {
        public Task<PaymentCheckoutSession> CreateCheckoutAsync(PaymentCheckoutRequest request, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new PaymentCheckoutSession($"fake_{request.TransactionId:N}", $"https://fake-pay/{request.TransactionId:N}"));
        }
    }
}