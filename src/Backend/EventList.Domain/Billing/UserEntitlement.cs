using EventList.Domain.Users;

namespace EventList.Domain.Billing;

public sealed class UserEntitlement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public int SmsCreditsBalance { get; set; }
    public DateTimeOffset? PremiumUntilUtc { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

    public bool HasPremiumAccess => PremiumUntilUtc is not null && PremiumUntilUtc > DateTimeOffset.UtcNow;
}