using EventList.Domain.Users;

namespace EventList.Domain.Templates;

public sealed class InvitationTemplate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerUserId { get; set; }
    public User? OwnerUser { get; set; }
    public string Name { get; set; } = string.Empty;
    public DeliveryChannel Channel { get; set; } = DeliveryChannel.Email;
    public string Language { get; set; } = "en";
    public string SubjectTemplate { get; set; } = string.Empty;
    public string BodyTemplate { get; set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

public enum DeliveryChannel
{
    Email = 1,
    Sms = 2
}