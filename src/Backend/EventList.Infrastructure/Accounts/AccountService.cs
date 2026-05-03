using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using EventList.Application.Accounts;
using EventList.Domain.Users;
using EventList.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace EventList.Infrastructure.Accounts;

public sealed class AccountService(
    ApplicationDbContext dbContext,
    IPasswordHasher<User> passwordHasher,
    IJwtTokenService jwtTokenService,
    INotificationSink notificationSink,
    IOptions<JwtOptions> jwtOptions,
    IOptions<BootstrapAdminOptions> bootstrapAdminOptions,
    ILogger<AccountService> logger) : IAccountService
{
    private readonly ApplicationDbContext _dbContext = dbContext;
    private readonly IPasswordHasher<User> _passwordHasher = passwordHasher;
    private readonly IJwtTokenService _jwtTokenService = jwtTokenService;
    private readonly INotificationSink _notificationSink = notificationSink;
    private readonly JwtOptions _jwtOptions = jwtOptions.Value;
    private readonly BootstrapAdminOptions _bootstrapAdminOptions = bootstrapAdminOptions.Value;
    private readonly ILogger<AccountService> _logger = logger;

    public async Task<RegistrationResult> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        await EnsureEmailIsAvailableAsync(email, cancellationToken);

        var user = new User
        {
            Email = email,
            PreferredLanguage = NormalizeLanguage(request.PreferredLanguage),
            TimeZone = NormalizeTimeZone(request.TimeZone),
            Role = AccountRole.FreeUser,
            EmailConfirmed = false
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        var token = CreateToken(user, VerificationTokenType.EmailConfirmation, TimeSpan.FromHours(24));

        _dbContext.Users.Add(user);
        _dbContext.VerificationTokens.Add(token.StoredToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _notificationSink.SendEmailConfirmationAsync(user, token.RawToken, request.ConfirmEmailBaseUrl, cancellationToken);

        return new RegistrationResult(user.Id, true);
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _dbContext.Users.SingleOrDefaultAsync(x => x.Email == email, cancellationToken)
            ?? throw new InvalidOperationException("Invalid email or password.");

        var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verificationResult == PasswordVerificationResult.Failed)
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        if (!user.EmailConfirmed)
        {
            throw new InvalidOperationException("Email address has not been confirmed.");
        }

        user.LastLoginAtUtc = DateTimeOffset.UtcNow;
        var authResult = CreateAuthResult(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return authResult;
    }

    public async Task<AuthResult> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        var tokenHash = HashToken(request.RefreshToken);
        var session = await _dbContext.RefreshSessions
            .Include(x => x.User)
            .SingleOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken)
            ?? throw new InvalidOperationException("Refresh token is invalid.");

        ValidateRefreshSession(session);

        var user = session.User!;
        if (!user.EmailConfirmed)
        {
            throw new InvalidOperationException("Email address has not been confirmed.");
        }

        var rotatedToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        session.TokenHash = HashToken(rotatedToken);
        session.LastUsedAtUtc = DateTimeOffset.UtcNow;
        session.ExpiresAtUtc = DateTimeOffset.UtcNow.AddDays(_jwtOptions.RefreshTokenLifetimeDays);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return _jwtTokenService.CreateToken(user, session.Id, rotatedToken, session.ExpiresAtUtc);
    }

    public async Task ConfirmEmailAsync(ConfirmEmailRequest request, CancellationToken cancellationToken = default)
    {
        var tokenHash = HashToken(request.Token);
        var verificationToken = await _dbContext.VerificationTokens
            .Include(x => x.User)
            .SingleOrDefaultAsync(x => x.TokenHash == tokenHash && x.Type == VerificationTokenType.EmailConfirmation, cancellationToken)
            ?? throw new InvalidOperationException("Token is invalid.");

        ValidateToken(verificationToken);

        verificationToken.UsedAtUtc = DateTimeOffset.UtcNow;
        verificationToken.User!.EmailConfirmed = true;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RequestPasswordResetAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _dbContext.Users.SingleOrDefaultAsync(x => x.Email == email, cancellationToken);
        if (user is null)
        {
            _logger.LogInformation("Password reset requested for non-existent email {Email}.", email);
            return;
        }

        var token = CreateToken(user, VerificationTokenType.PasswordReset, TimeSpan.FromHours(2));
        _dbContext.VerificationTokens.Add(token.StoredToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _notificationSink.SendPasswordResetAsync(user, token.RawToken, request.ResetPasswordBaseUrl, cancellationToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var tokenHash = HashToken(request.Token);
        var verificationToken = await _dbContext.VerificationTokens
            .Include(x => x.User)
            .SingleOrDefaultAsync(x => x.TokenHash == tokenHash && x.Type == VerificationTokenType.PasswordReset, cancellationToken)
            ?? throw new InvalidOperationException("Token is invalid.");

        ValidateToken(verificationToken);

        var user = verificationToken.User!;
        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
        verificationToken.UsedAtUtc = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<CreateUserResult> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        await EnsureEmailIsAvailableAsync(email, cancellationToken);

        var user = new User
        {
            Email = email,
            PreferredLanguage = NormalizeLanguage(request.PreferredLanguage),
            TimeZone = NormalizeTimeZone(request.TimeZone),
            Role = request.Role,
            EmailConfirmed = true
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new CreateUserResult(user.Id, user.Role);
    }

    public async Task<IReadOnlyList<AdminUserDto>> GetUsersAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .AsNoTracking()
            .OrderBy(x => x.Email)
            .Select(MapAdminUserDtoExpression())
            .ToListAsync(cancellationToken);
    }

    public async Task<AdminUserDto?> GetUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .AsNoTracking()
            .Where(x => x.Id == userId)
            .Select(MapAdminUserDtoExpression())
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<AdminUserDto> UpdateUserAsync(Guid userId, UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _dbContext.Users.SingleOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new InvalidOperationException("User was not found.");

        var emailInUse = await _dbContext.Users.AnyAsync(x => x.Id != userId && x.Email == email, cancellationToken);
        if (emailInUse)
        {
            throw new InvalidOperationException("Email address is already registered.");
        }

        user.Email = email;
        user.PreferredLanguage = NormalizeLanguage(request.PreferredLanguage);
        user.TimeZone = NormalizeTimeZone(request.TimeZone);
        user.Role = request.Role;
        user.EmailConfirmed = request.EmailConfirmed;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new AdminUserDto(
            user.Id,
            user.Email,
            user.PreferredLanguage,
            user.TimeZone,
            user.EmailConfirmed,
            user.Role,
            user.CreatedAtUtc,
            user.LastLoginAtUtc);
    }

    public async Task LogoutCurrentSessionAsync(Guid userId, Guid sessionId, CancellationToken cancellationToken = default)
    {
        var session = await _dbContext.RefreshSessions
            .SingleOrDefaultAsync(x => x.Id == sessionId && x.UserId == userId, cancellationToken);

        if (session is null || session.RevokedAtUtc is not null)
        {
            return;
        }

        session.RevokedAtUtc = DateTimeOffset.UtcNow;
        session.RevokedReason = "User logout";
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task LogoutAllSessionsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var sessions = await _dbContext.RefreshSessions
            .Where(x => x.UserId == userId && x.RevokedAtUtc == null)
            .ToListAsync(cancellationToken);

        if (sessions.Count == 0)
        {
            return;
        }

        var revokedAtUtc = DateTimeOffset.UtcNow;
        foreach (var session in sessions)
        {
            session.RevokedAtUtc = revokedAtUtc;
            session.RevokedReason = "User logout from all sessions";
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<UserProfileDto?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .Where(x => x.Id == userId)
            .Select(x => new UserProfileDto(x.Id, x.Email, x.PreferredLanguage, x.TimeZone, x.EmailConfirmed, x.Role))
            .SingleOrDefaultAsync(cancellationToken);
    }

    internal async Task EnsureBootstrapAdminAsync(CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_bootstrapAdminOptions.Email) || string.IsNullOrWhiteSpace(_bootstrapAdminOptions.Password))
        {
            return;
        }

        var email = NormalizeEmail(_bootstrapAdminOptions.Email);
        var exists = await _dbContext.Users.AnyAsync(x => x.Email == email, cancellationToken);
        if (exists)
        {
            return;
        }

        var user = new User
        {
            Email = email,
            PreferredLanguage = NormalizeLanguage(_bootstrapAdminOptions.PreferredLanguage),
            TimeZone = NormalizeTimeZone(_bootstrapAdminOptions.TimeZone),
            Role = AccountRole.Administrator,
            EmailConfirmed = true
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, _bootstrapAdminOptions.Password);

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Bootstrap administrator {Email} created.", email);
    }

    private async Task EnsureEmailIsAvailableAsync(string email, CancellationToken cancellationToken)
    {
        if (await _dbContext.Users.AnyAsync(x => x.Email == email, cancellationToken))
        {
            throw new InvalidOperationException("Email address is already registered.");
        }
    }

    private static void ValidateToken(VerificationToken verificationToken)
    {
        if (verificationToken.UsedAtUtc is not null || verificationToken.ExpiresAtUtc <= DateTimeOffset.UtcNow)
        {
            throw new InvalidOperationException("Token has expired or was already used.");
        }
    }

    private static void ValidateRefreshSession(RefreshSession session)
    {
        if (session.RevokedAtUtc is not null || session.ExpiresAtUtc <= DateTimeOffset.UtcNow)
        {
            throw new InvalidOperationException("Refresh token has expired or was revoked.");
        }
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private static string NormalizeLanguage(string preferredLanguage) => string.IsNullOrWhiteSpace(preferredLanguage)
        ? "en"
        : preferredLanguage.Trim().ToLowerInvariant();

    private static string NormalizeTimeZone(string timeZone) => string.IsNullOrWhiteSpace(timeZone)
        ? "UTC"
        : timeZone.Trim();

    private static (string RawToken, VerificationToken StoredToken) CreateToken(User user, VerificationTokenType type, TimeSpan lifetime)
    {
        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        return (rawToken, new VerificationToken
        {
            User = user,
            UserId = user.Id,
            TokenHash = HashToken(rawToken),
            Type = type,
            ExpiresAtUtc = DateTimeOffset.UtcNow.Add(lifetime)
        });
    }

    private AuthResult CreateAuthResult(User user)
    {
        var refreshToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var session = new RefreshSession
        {
            User = user,
            UserId = user.Id,
            TokenHash = HashToken(refreshToken),
            ExpiresAtUtc = DateTimeOffset.UtcNow.AddDays(_jwtOptions.RefreshTokenLifetimeDays),
            LastUsedAtUtc = DateTimeOffset.UtcNow
        };

        _dbContext.RefreshSessions.Add(session);

        return _jwtTokenService.CreateToken(user, session.Id, refreshToken, session.ExpiresAtUtc);
    }

    private static string HashToken(string token)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    }

    private static System.Linq.Expressions.Expression<Func<User, AdminUserDto>> MapAdminUserDtoExpression()
    {
        return user => new AdminUserDto(
            user.Id,
            user.Email,
            user.PreferredLanguage,
            user.TimeZone,
            user.EmailConfirmed,
            user.Role,
            user.CreatedAtUtc,
            user.LastLoginAtUtc);
    }
}

internal sealed class JwtTokenService(IOptions<JwtOptions> options) : IJwtTokenService
{
    private readonly JwtOptions _options = options.Value;

    public AuthResult CreateToken(User user, Guid sessionId, string refreshToken, DateTimeOffset refreshTokenExpiresAtUtc)
    {
        var expiresAtUtc = DateTimeOffset.UtcNow.AddMinutes(_options.AccessTokenLifetimeMinutes);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString()),
            new(JwtRegisteredClaimNames.Sid, sessionId.ToString())
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var jwt = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: expiresAtUtc.UtcDateTime,
            signingCredentials: credentials);

        var token = new JwtSecurityTokenHandler().WriteToken(jwt);
        var userProfile = new UserProfileDto(user.Id, user.Email, user.PreferredLanguage, user.TimeZone, user.EmailConfirmed, user.Role);

        return new AuthResult(userProfile, token, expiresAtUtc, refreshToken, refreshTokenExpiresAtUtc, sessionId);
    }
}

internal sealed class DevelopmentNotificationSink(ILogger<DevelopmentNotificationSink> logger) : INotificationSink
{
    private readonly ILogger<DevelopmentNotificationSink> _logger = logger;

    public Task SendEmailConfirmationAsync(User user, string token, string? confirmEmailBaseUrl = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Email confirmation token for {Email}: {Token}", user.Email, token);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetAsync(User user, string token, string? resetPasswordBaseUrl = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Password reset token for {Email}: {Token}", user.Email, token);
        return Task.CompletedTask;
    }
}

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";
    public string Issuer { get; set; } = "EventList.Api";
    public string Audience { get; set; } = "EventList.Clients";
    public string SigningKey { get; set; } = string.Empty;
    public int AccessTokenLifetimeMinutes { get; set; } = 60;
    public int RefreshTokenLifetimeDays { get; set; } = 30;
}

public sealed class BootstrapAdminOptions
{
    public const string SectionName = "BootstrapAdmin";
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PreferredLanguage { get; set; } = "en";
    public string TimeZone { get; set; } = "UTC";
}

public sealed class SmtpOptions
{
    public const string SectionName = "Smtp";
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool EnableSsl { get; set; } = true;
    public string FromAddress { get; set; } = string.Empty;
    public string FromName { get; set; } = "EventList";
    public string ConfirmEmailBaseUrl { get; set; } = string.Empty;
    public string ResetPasswordBaseUrl { get; set; } = string.Empty;
}