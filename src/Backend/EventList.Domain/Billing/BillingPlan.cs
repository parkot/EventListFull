namespace EventList.Domain.Billing;

public sealed class BillingPlan
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public BillingPlanType Type { get; set; }
    public decimal PriceAmount { get; set; }
    public string Currency { get; set; } = "EUR";
    public int PremiumDurationDays { get; set; }
    public int SmsCredits { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

public enum BillingPlanType
{
    PremiumSubscription = 1,
    SmsCreditPack = 2
}