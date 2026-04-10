using EventList.Domain.Billing;

namespace EventList.Application.Billing;

public interface IBillingService
{
    Task<IReadOnlyList<BillingPlanDto>> GetCatalogAsync(CancellationToken cancellationToken = default);
    Task<BillingEntitlementDto> GetMyEntitlementsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<CheckoutSessionDto> CreateCheckoutAsync(Guid userId, CreateCheckoutRequest request, CancellationToken cancellationToken = default);
    Task<BillingTransactionDto> CompleteCheckoutAsync(CompleteCheckoutRequest request, CancellationToken cancellationToken = default);
}

public interface IPaymentGateway
{
    Task<PaymentCheckoutSession> CreateCheckoutAsync(PaymentCheckoutRequest request, CancellationToken cancellationToken = default);
}

public sealed record CreateCheckoutRequest(Guid PlanId);

public sealed record CompleteCheckoutRequest(string ExternalPaymentId);

public sealed record PaymentCheckoutRequest(Guid TransactionId, string PlanCode, decimal Amount, string Currency, string Description);

public sealed record PaymentCheckoutSession(string ExternalPaymentId, string CheckoutUrl);

public sealed record BillingPlanDto(Guid Id, string Code, string Name, BillingPlanType Type, decimal PriceAmount, string Currency, int PremiumDurationDays, int SmsCredits);

public sealed record BillingEntitlementDto(Guid UserId, bool HasPremiumAccess, DateTimeOffset? PremiumUntilUtc, int SmsCreditsBalance, int MaxGuestsPerEvent, bool CanUseSms);

public sealed record CheckoutSessionDto(Guid TransactionId, Guid PlanId, string ExternalPaymentId, string CheckoutUrl, decimal Amount, string Currency, BillingTransactionStatus Status);

public sealed record BillingTransactionDto(Guid TransactionId, Guid PlanId, BillingTransactionStatus Status, decimal Amount, string Currency, DateTimeOffset? CompletedAtUtc, BillingEntitlementDto Entitlements);