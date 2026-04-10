using EventList.Domain.Delivery;
using EventList.Domain.Templates;

namespace EventList.Application.Delivery;

public interface IDeliveryService
{
    Task<IReadOnlyList<DeliveryLogDto>> SendInvitationsAsync(Guid ownerUserId, Guid eventId, SendInvitationsRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DeliveryLogDto>> GetDeliveryLogsAsync(Guid ownerUserId, Guid eventId, CancellationToken cancellationToken = default);
}

public interface IInvitationDeliveryProvider
{
    Task<DeliveryProviderResult> SendAsync(DeliveryMessage message, CancellationToken cancellationToken = default);
}

public sealed record SendInvitationsRequest(Guid TemplateId, IReadOnlyList<Guid>? GuestIds);

public sealed record DeliveryMessage(
    DeliveryChannel Channel,
    string Recipient,
    string Subject,
    string Body,
    Guid EventId,
    Guid GuestId,
    Guid TemplateId);

public sealed record DeliveryProviderResult(bool Success, string ProviderMessageId, string ErrorMessage);

public sealed record DeliveryLogDto(
    Guid Id,
    Guid GuestId,
    string GuestName,
    DeliveryChannel Channel,
    DeliveryStatus Status,
    string Recipient,
    string Subject,
    string ProviderMessageId,
    string ErrorMessage,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? SentAtUtc);