namespace EventList.Domain.Users;

public sealed class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PreferredLanguage { get; set; } = "en";
    public string TimeZone { get; set; } = "UTC";
    public bool EmailConfirmed { get; set; }
    public AccountRole Role { get; set; } = AccountRole.FreeUser;
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? LastLoginAtUtc { get; set; }
    public ICollection<VerificationToken> VerificationTokens { get; set; } = new List<VerificationToken>();
    public ICollection<RefreshSession> RefreshSessions { get; set; } = new List<RefreshSession>();
}

public enum AccountRole
{
    FreeUser = 1,
    PremiumUser = 2,
    Administrator = 3
}