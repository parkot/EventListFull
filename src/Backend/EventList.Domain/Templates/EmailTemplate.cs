namespace EventList.Domain.Templates;

public sealed class EmailTemplate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public EmailTemplateType Type { get; set; } = EmailTemplateType.UserRegistrationConfirm;
    public string Language { get; set; } = "en";
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

public enum EmailTemplateType
{
    UserRegistrationConfirm = 1,
    PasswordReset = 2,
    WelcomeMessage = 3,
    InvitationReminder = 4,
    EventUpdated = 5
}