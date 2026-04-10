using EventList.Domain.Events;
using EventList.Domain.Templates;

namespace EventList.Domain.Delivery;

public sealed class DeliveryLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public Event? Event { get; set; }
    public Guid GuestId { get; set; }
    public Guest? Guest { get; set; }
    public Guid TemplateId { get; set; }
    public InvitationTemplate? Template { get; set; }
    public DeliveryChannel Channel { get; set; }
    public DeliveryStatus Status { get; set; } = DeliveryStatus.Pending;
    public string Recipient { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string ProviderMessageId { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? SentAtUtc { get; set; }
}

public enum DeliveryStatus
{
    Pending = 0,
    Sent = 1,
    Failed = 2
}