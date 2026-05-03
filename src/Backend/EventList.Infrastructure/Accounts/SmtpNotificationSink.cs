using System.Net;
using System.Net.Mail;
using EventList.Application.Accounts;
using EventList.Application.Templates;
using EventList.Domain.Templates;
using EventList.Domain.Users;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace EventList.Infrastructure.Accounts;

internal sealed class SmtpNotificationSink(
    IOptions<SmtpOptions> smtpOptions,
    IEmailTemplateService emailTemplateService,
    ILogger<SmtpNotificationSink> logger) : INotificationSink
{
    private readonly SmtpOptions _smtp = smtpOptions.Value;
    private readonly IEmailTemplateService _emailTemplateService = emailTemplateService;
    private readonly ILogger<SmtpNotificationSink> _logger = logger;

    public async Task SendEmailConfirmationAsync(User user, string token, string? confirmEmailBaseUrl = null, CancellationToken cancellationToken = default)
    {
        var baseUrl = !string.IsNullOrWhiteSpace(confirmEmailBaseUrl) ? confirmEmailBaseUrl : _smtp.ConfirmEmailBaseUrl;
        var link = BuildTokenLink(baseUrl, token);

        var template = await _emailTemplateService.ResolveTemplateAsync(
            EmailTemplateType.UserRegistrationConfirm,
            user.PreferredLanguage,
            cancellationToken);

        var subject = ApplyTokens(template.Subject, user, token, link, token);
        var body = ApplyTokens(template.Body, user, token, link, token);

        if (string.IsNullOrWhiteSpace(_smtp.Host))
        {
            _logger.LogInformation("Email confirmation token for {Email}: {Token}", user.Email, token);
            return;
        }

        await SendAsync(user.Email, subject, body, cancellationToken);
    }

    public async Task SendPasswordResetAsync(User user, string token, string? resetPasswordBaseUrl = null, CancellationToken cancellationToken = default)
    {
        var baseUrl = !string.IsNullOrWhiteSpace(resetPasswordBaseUrl) ? resetPasswordBaseUrl : _smtp.ResetPasswordBaseUrl;
        var link = BuildTokenLink(baseUrl, token);

        var template = await _emailTemplateService.ResolveTemplateAsync(
            EmailTemplateType.PasswordReset,
            user.PreferredLanguage,
            cancellationToken);

        var subject = ApplyTokens(template.Subject, user, token, token, link);
        var body = ApplyTokens(template.Body, user, token, token, link);

        if (string.IsNullOrWhiteSpace(_smtp.Host))
        {
            _logger.LogInformation("Password reset token for {Email}: {Token}", user.Email, token);
            return;
        }

        await SendAsync(user.Email, subject, body, cancellationToken);
    }

    private static string ApplyTokens(string template, User user, string token, string confirmationLink, string resetLink)
    {
        return template
            .Replace("{{Email}}", user.Email, StringComparison.Ordinal)
            .Replace("{{Token}}", token, StringComparison.Ordinal)
            .Replace("{{ConfirmationLink}}", confirmationLink, StringComparison.Ordinal)
            .Replace("{{ResetLink}}", resetLink, StringComparison.Ordinal)
            .Replace("{{EventTitle}}", "", StringComparison.Ordinal)
            .Replace("{{EventDate}}", "", StringComparison.Ordinal)
            .Replace("{{EventLink}}", "", StringComparison.Ordinal);
    }

    private static string BuildTokenLink(string baseUrl, string token)
    {
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return token;
        }

        var separator = baseUrl.Contains('?')
            ? baseUrl.EndsWith('?') || baseUrl.EndsWith('&')
                ? string.Empty
                : "&"
            : "?";

        return $"{baseUrl}{separator}token={Uri.EscapeDataString(token)}";
    }

    private async Task SendAsync(string to, string subject, string body, CancellationToken cancellationToken)
    {
        using var client = new SmtpClient(_smtp.Host, _smtp.Port)
        {
            EnableSsl = _smtp.EnableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(_smtp.Username, _smtp.Password)
        };

        var from = string.IsNullOrWhiteSpace(_smtp.FromAddress)
            ? new MailAddress(_smtp.Username)
            : new MailAddress(_smtp.FromAddress, _smtp.FromName);

        using var message = new MailMessage(from, new MailAddress(to))
        {
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };

        _logger.LogInformation("Sending email to {To} with subject '{Subject}'.", to, subject);

        await client.SendMailAsync(message, cancellationToken);

        _logger.LogInformation("Email sent to {To}.", to);
    }
}
