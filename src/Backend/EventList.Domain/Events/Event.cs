using EventList.Domain.Users;

namespace EventList.Domain.Events;

public sealed class Event
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerUserId { get; set; }
    public User? OwnerUser { get; set; }
    public string Title { get; set; } = string.Empty;
    public string OccasionType { get; set; } = string.Empty;
    public DateTimeOffset ScheduledAtUtc { get; set; }
    public string Venue { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string TimeZone { get; set; } = "UTC";
    public string DefaultLanguage { get; set; } = "en";
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public ICollection<Guest> Guests { get; set; } = new List<Guest>();
}