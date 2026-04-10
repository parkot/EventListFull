using EventList.Application.Delivery;
using EventList.Domain.Billing;
using EventList.Domain.Delivery;
using EventList.Domain.Events;
using EventList.Domain.Templates;
using EventList.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EventList.Infrastructure.Delivery;

public sealed class DeliveryService(
    ApplicationDbContext dbContext,
    IInvitationDeliveryProvider provider,
    Billing.BillingService billingService,
    ILogger<DeliveryService> logger) : IDeliveryService
{
    private readonly ApplicationDbContext _dbContext = dbContext;
    private readonly IInvitationDeliveryProvider _provider = provider;
    private readonly Billing.BillingService _billingService = billingService;
    private readonly ILogger<DeliveryService> _logger = logger;

    public async Task<IReadOnlyList<DeliveryLogDto>> SendInvitationsAsync(Guid ownerUserId, Guid eventId, SendInvitationsRequest request, CancellationToken cancellationToken = default)
    {
        var eventEntity = await _dbContext.Events
            .Include(x => x.Guests)
                .ThenInclude(x => x.Invitation)
            .SingleOrDefaultAsync(x => x.OwnerUserId == ownerUserId && x.Id == eventId, cancellationToken)
            ?? throw new InvalidOperationException("Event was not found.");

        var template = await _dbContext.InvitationTemplates
            .SingleOrDefaultAsync(x => x.OwnerUserId == ownerUserId && x.Id == request.TemplateId, cancellationToken)
            ?? throw new InvalidOperationException("Template was not found.");

        var entitlements = await _billingService.GetOrCreateEntitlementAsync(ownerUserId, cancellationToken);

        var selectedGuests = eventEntity.Guests
            .Where(x => request.GuestIds is null || request.GuestIds.Count == 0 || request.GuestIds.Contains(x.Id))
            .ToList();

        if (!entitlements.HasPremiumAccess && selectedGuests.Count > 100)
        {
            throw new InvalidOperationException("Free users can send invitations to at most 100 guests per operation. Upgrade to premium for larger send batches.");
        }

        if (template.Channel == DeliveryChannel.Sms && entitlements.SmsCreditsBalance < selectedGuests.Count)
        {
            throw new InvalidOperationException("Not enough SMS credits to send this batch.");
        }

        var logs = new List<DeliveryLog>();
        foreach (var guest in selectedGuests)
        {
            var recipient = ResolveRecipient(template.Channel, guest);
            var subject = RenderTemplate(template.SubjectTemplate, eventEntity, guest);
            var body = RenderTemplate(template.BodyTemplate, eventEntity, guest);

            var message = new DeliveryMessage(template.Channel, recipient, subject, body, eventEntity.Id, guest.Id, template.Id);
            var providerResult = await _provider.SendAsync(message, cancellationToken);

            var log = new DeliveryLog
            {
                EventId = eventEntity.Id,
                GuestId = guest.Id,
                TemplateId = template.Id,
                Channel = template.Channel,
                Status = providerResult.Success ? DeliveryStatus.Sent : DeliveryStatus.Failed,
                Recipient = recipient,
                Subject = subject,
                Body = body,
                ProviderMessageId = providerResult.ProviderMessageId,
                ErrorMessage = providerResult.ErrorMessage,
                SentAtUtc = providerResult.Success ? DateTimeOffset.UtcNow : null
            };

            logs.Add(log);
            _dbContext.DeliveryLogs.Add(log);
        }

        if (template.Channel == DeliveryChannel.Sms)
        {
            entitlements.SmsCreditsBalance -= selectedGuests.Count;
            entitlements.UpdatedAtUtc = DateTimeOffset.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return logs.Select(x => Map(x, selectedGuests.Single(g => g.Id == x.GuestId))).ToList();
    }

    public async Task<IReadOnlyList<DeliveryLogDto>> GetDeliveryLogsAsync(Guid ownerUserId, Guid eventId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.DeliveryLogs
            .AsNoTracking()
            .Where(x => x.EventId == eventId && x.Event!.OwnerUserId == ownerUserId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new DeliveryLogDto(
                x.Id,
                x.GuestId,
                x.Guest!.FullName,
                x.Channel,
                x.Status,
                x.Recipient,
                x.Subject,
                x.ProviderMessageId,
                x.ErrorMessage,
                x.CreatedAtUtc,
                x.SentAtUtc))
            .ToListAsync(cancellationToken);
    }

    private string ResolveRecipient(DeliveryChannel channel, Guest guest)
    {
        var recipient = channel switch
        {
            DeliveryChannel.Email => guest.Email,
            DeliveryChannel.Sms => guest.PhoneNumber,
            _ => string.Empty
        };

        if (string.IsNullOrWhiteSpace(recipient))
        {
            throw new InvalidOperationException($"Guest '{guest.FullName}' is missing a recipient for channel {channel}.");
        }

        return recipient;
    }

    private static string RenderTemplate(string template, Event eventEntity, Guest guest)
    {
        return template
            .Replace("{{GuestName}}", guest.FullName, StringComparison.Ordinal)
            .Replace("{{EventTitle}}", eventEntity.Title, StringComparison.Ordinal)
            .Replace("{{Venue}}", eventEntity.Venue, StringComparison.Ordinal)
            .Replace("{{Address}}", eventEntity.Address, StringComparison.Ordinal)
            .Replace("{{EventDateUtc}}", eventEntity.ScheduledAtUtc.ToString("u"), StringComparison.Ordinal)
            .Replace("{{InvitationLink}}", $"/api/invitations/{guest.Invitation?.PublicCode}", StringComparison.Ordinal)
            .Replace("{{ScanCode}}", guest.Invitation?.ScanCode ?? string.Empty, StringComparison.Ordinal)
            .Replace("{{TableNumber}}", guest.TableNumber?.ToString() ?? string.Empty, StringComparison.Ordinal);
    }

    private static DeliveryLogDto Map(DeliveryLog log, Guest guest) =>
        new(log.Id, log.GuestId, guest.FullName, log.Channel, log.Status, log.Recipient, log.Subject, log.ProviderMessageId, log.ErrorMessage, log.CreatedAtUtc, log.SentAtUtc);
}

internal sealed class DevelopmentInvitationDeliveryProvider(ILogger<DevelopmentInvitationDeliveryProvider> logger) : IInvitationDeliveryProvider
{
    private readonly ILogger<DevelopmentInvitationDeliveryProvider> _logger = logger;

    public Task<DeliveryProviderResult> SendAsync(DeliveryMessage message, CancellationToken cancellationToken = default)
    {
        var providerMessageId = Guid.NewGuid().ToString("N");
        _logger.LogInformation(
            "Development delivery via {Channel} to {Recipient}. Subject: {Subject}. Body: {Body}. MessageId: {ProviderMessageId}",
            message.Channel,
            message.Recipient,
            message.Subject,
            message.Body,
            providerMessageId);

        return Task.FromResult(new DeliveryProviderResult(true, providerMessageId, string.Empty));
    }
}