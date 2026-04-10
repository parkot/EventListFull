namespace EventList.Domain.Events;

public sealed class Invitation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public Event? Event { get; set; }
    public Guid GuestId { get; set; }
    public Guest? Guest { get; set; }
    public string PublicCode { get; set; } = string.Empty;
    public string ScanCode { get; set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? LastViewedAtUtc { get; set; }
}