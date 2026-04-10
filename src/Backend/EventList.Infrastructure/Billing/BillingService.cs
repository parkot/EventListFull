using EventList.Application.Billing;
using EventList.Domain.Billing;
using EventList.Domain.Users;
using EventList.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EventList.Infrastructure.Billing;

public sealed class BillingService(
    ApplicationDbContext dbContext,
    IPaymentGateway paymentGateway,
    ILogger<BillingService> logger) : IBillingService
{
    private readonly ApplicationDbContext _dbContext = dbContext;
    private readonly IPaymentGateway _paymentGateway = paymentGateway;
    private readonly ILogger<BillingService> _logger = logger;

    public async Task<IReadOnlyList<BillingPlanDto>> GetCatalogAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.BillingPlans
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Type)
            .ThenBy(x => x.PriceAmount)
            .Select(x => new BillingPlanDto(x.Id, x.Code, x.Name, x.Type, x.PriceAmount, x.Currency, x.PremiumDurationDays, x.SmsCredits))
            .ToListAsync(cancellationToken);
    }

    public async Task<BillingEntitlementDto> GetMyEntitlementsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var entitlement = await GetOrCreateEntitlementAsync(userId, cancellationToken);
        return MapEntitlements(entitlement);
    }

    public async Task<CheckoutSessionDto> CreateCheckoutAsync(Guid userId, CreateCheckoutRequest request, CancellationToken cancellationToken = default)
    {
        var plan = await _dbContext.BillingPlans.SingleOrDefaultAsync(x => x.Id == request.PlanId && x.IsActive, cancellationToken)
            ?? throw new InvalidOperationException("Billing plan was not found.");

        var transaction = new BillingTransaction
        {
            UserId = userId,
            PlanId = plan.Id,
            Amount = plan.PriceAmount,
            Currency = plan.Currency
        };

        var session = await _paymentGateway.CreateCheckoutAsync(
            new PaymentCheckoutRequest(transaction.Id, plan.Code, plan.PriceAmount, plan.Currency, plan.Name),
            cancellationToken);

        transaction.ExternalPaymentId = session.ExternalPaymentId;
        transaction.CheckoutUrl = session.CheckoutUrl;

        _dbContext.BillingTransactions.Add(transaction);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new CheckoutSessionDto(transaction.Id, plan.Id, transaction.ExternalPaymentId, transaction.CheckoutUrl, transaction.Amount, transaction.Currency, transaction.Status);
    }

    public async Task<BillingTransactionDto> CompleteCheckoutAsync(CompleteCheckoutRequest request, CancellationToken cancellationToken = default)
    {
        var transaction = await _dbContext.BillingTransactions
            .Include(x => x.Plan)
            .Include(x => x.User)
            .SingleOrDefaultAsync(x => x.ExternalPaymentId == request.ExternalPaymentId, cancellationToken)
            ?? throw new InvalidOperationException("Billing transaction was not found.");

        if (transaction.Status == BillingTransactionStatus.Completed)
        {
            var existingEntitlement = await GetOrCreateEntitlementAsync(transaction.UserId, cancellationToken);
            return new BillingTransactionDto(transaction.Id, transaction.PlanId, transaction.Status, transaction.Amount, transaction.Currency, transaction.CompletedAtUtc, MapEntitlements(existingEntitlement));
        }

        var entitlement = await GetOrCreateEntitlementAsync(transaction.UserId, cancellationToken);
        ApplyPlan(transaction.Plan!, entitlement, transaction.User!);

        transaction.Status = BillingTransactionStatus.Completed;
        transaction.CompletedAtUtc = DateTimeOffset.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Billing transaction {TransactionId} completed for user {UserId} and plan {PlanCode}.", transaction.Id, transaction.UserId, transaction.Plan!.Code);

        return new BillingTransactionDto(transaction.Id, transaction.PlanId, transaction.Status, transaction.Amount, transaction.Currency, transaction.CompletedAtUtc, MapEntitlements(entitlement));
    }

    internal async Task<UserEntitlement> GetOrCreateEntitlementAsync(Guid userId, CancellationToken cancellationToken)
    {
        var entitlement = await _dbContext.UserEntitlements.SingleOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (entitlement is not null)
        {
            return entitlement;
        }

        entitlement = new UserEntitlement { UserId = userId };
        _dbContext.UserEntitlements.Add(entitlement);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entitlement;
    }

    private static BillingEntitlementDto MapEntitlements(UserEntitlement entitlement)
    {
        var hasPremium = entitlement.HasPremiumAccess;
        return new BillingEntitlementDto(entitlement.UserId, hasPremium, entitlement.PremiumUntilUtc, entitlement.SmsCreditsBalance, hasPremium ? int.MaxValue : 100, entitlement.SmsCreditsBalance > 0);
    }

    private static void ApplyPlan(BillingPlan plan, UserEntitlement entitlement, User user)
    {
        if (plan.Type == BillingPlanType.PremiumSubscription)
        {
            entitlement.PremiumUntilUtc = entitlement.PremiumUntilUtc is not null && entitlement.PremiumUntilUtc > DateTimeOffset.UtcNow
                ? entitlement.PremiumUntilUtc.Value.AddDays(plan.PremiumDurationDays)
                : DateTimeOffset.UtcNow.AddDays(plan.PremiumDurationDays);
            user.Role = AccountRole.PremiumUser;
        }

        if (plan.Type == BillingPlanType.SmsCreditPack)
        {
            entitlement.SmsCreditsBalance += plan.SmsCredits;
        }

        entitlement.UpdatedAtUtc = DateTimeOffset.UtcNow;
    }
}

internal sealed class DevelopmentPaymentGateway(ILogger<DevelopmentPaymentGateway> logger) : IPaymentGateway
{
    private readonly ILogger<DevelopmentPaymentGateway> _logger = logger;

    public Task<PaymentCheckoutSession> CreateCheckoutAsync(PaymentCheckoutRequest request, CancellationToken cancellationToken = default)
    {
        var externalPaymentId = $"devpay_{Guid.NewGuid():N}";
        var checkoutUrl = $"https://sandbox.vivawallet.local/checkout/{externalPaymentId}";
        _logger.LogInformation("Development checkout created for transaction {TransactionId} plan {PlanCode}: {ExternalPaymentId}", request.TransactionId, request.PlanCode, externalPaymentId);
        return Task.FromResult(new PaymentCheckoutSession(externalPaymentId, checkoutUrl));
    }
}