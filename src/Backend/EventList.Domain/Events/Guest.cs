namespace EventList.Domain.Events;

public sealed class Guest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public Event? Event { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string PreferredLanguage { get; set; } = "en";
    public int? TableNumber { get; set; }
    public RsvpStatus RsvpStatus { get; set; } = RsvpStatus.Pending;
    public DateTimeOffset? RespondedAtUtc { get; set; }
    public DateTimeOffset? CheckedInAtUtc { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public Invitation? Invitation { get; set; }
}

public enum RsvpStatus
{
    Pending = 0,
    Attending = 1,
    Declined = 2,
    Maybe = 3
}