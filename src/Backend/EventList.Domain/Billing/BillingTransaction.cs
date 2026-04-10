using EventList.Domain.Users;

namespace EventList.Domain.Billing;

public sealed class BillingTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid PlanId { get; set; }
    public BillingPlan? Plan { get; set; }
    public BillingTransactionStatus Status { get; set; } = BillingTransactionStatus.Pending;
    public string ExternalPaymentId { get; set; } = string.Empty;
    public string CheckoutUrl { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? CompletedAtUtc { get; set; }
    public string FailureReason { get; set; } = string.Empty;
}

public enum BillingTransactionStatus
{
    Pending = 0,
    Completed = 1,
    Failed = 2
}