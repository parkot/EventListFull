using EventList.Domain.Users;

namespace EventList.Application.Accounts;

public interface IAccountService
{
    Task<RegistrationResult> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken = default);
    Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<AuthResult> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);
    Task ConfirmEmailAsync(ConfirmEmailRequest request, CancellationToken cancellationToken = default);
    Task RequestPasswordResetAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);
    Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);
    Task<CreateUserResult> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AdminUserDto>> GetUsersAsync(CancellationToken cancellationToken = default);
    Task<AdminUserDto?> GetUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<AdminUserDto> UpdateUserAsync(Guid userId, UpdateUserRequest request, CancellationToken cancellationToken = default);
    Task LogoutCurrentSessionAsync(Guid userId, Guid sessionId, CancellationToken cancellationToken = default);
    Task LogoutAllSessionsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserProfileDto?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default);
}

public interface IJwtTokenService
{
    AuthResult CreateToken(User user, Guid sessionId, string refreshToken, DateTimeOffset refreshTokenExpiresAtUtc);
}

public interface INotificationSink
{
    Task SendEmailConfirmationAsync(User user, string token, CancellationToken cancellationToken = default);
    Task SendPasswordResetAsync(User user, string token, string? resetPasswordBaseUrl = null, CancellationToken cancellationToken = default);
}

public sealed record RegisterUserRequest(string Email, string Password, string PreferredLanguage, string TimeZone = "UTC");

public sealed record LoginRequest(string Email, string Password);

public sealed record RefreshTokenRequest(string RefreshToken);

public sealed record ConfirmEmailRequest(string Token);

public sealed record ForgotPasswordRequest(string Email, string? ResetPasswordBaseUrl = null);

public sealed record ResetPasswordRequest(string Token, string NewPassword);

public sealed record CreateUserRequest(string Email, string Password, string PreferredLanguage, AccountRole Role, string TimeZone = "UTC");

public sealed record RegistrationResult(Guid UserId, bool RequiresEmailConfirmation);

public sealed record CreateUserResult(Guid UserId, AccountRole Role);

public sealed record UpdateUserRequest(
    string Email,
    string PreferredLanguage,
    string TimeZone,
    AccountRole Role,
    bool EmailConfirmed);

public sealed record AdminUserDto(
    Guid Id,
    string Email,
    string PreferredLanguage,
    string TimeZone,
    bool EmailConfirmed,
    AccountRole Role,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? LastLoginAtUtc);

public sealed record AuthResult(
    UserProfileDto User,
    string AccessToken,
    DateTimeOffset ExpiresAtUtc,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAtUtc,
    Guid SessionId);

public sealed record UserProfileDto(Guid Id, string Email, string PreferredLanguage, string TimeZone, bool EmailConfirmed, AccountRole Role);