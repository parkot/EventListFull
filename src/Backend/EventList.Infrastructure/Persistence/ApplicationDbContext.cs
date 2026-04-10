using EventList.Domain.Billing;
using EventList.Domain.Delivery;
using EventList.Domain.Events;
using EventList.Domain.Templates;
using EventList.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace EventList.Infrastructure.Persistence;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<BillingPlan> BillingPlans => Set<BillingPlan>();
    public DbSet<BillingTransaction> BillingTransactions => Set<BillingTransaction>();
    public DbSet<DeliveryLog> DeliveryLogs => Set<DeliveryLog>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<Guest> Guests => Set<Guest>();
    public DbSet<Invitation> Invitations => Set<Invitation>();
    public DbSet<InvitationTemplate> InvitationTemplates => Set<InvitationTemplate>();
    public DbSet<UserEntitlement> UserEntitlements => Set<UserEntitlement>();
    public DbSet<User> Users => Set<User>();
    public DbSet<VerificationToken> VerificationTokens => Set<VerificationToken>();
    public DbSet<RefreshSession> RefreshSessions => Set<RefreshSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BillingPlan>(entity =>
        {
            entity.ToTable("BillingPlans");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Code).HasMaxLength(64).IsRequired();
            entity.Property(x => x.Name).HasMaxLength(128).IsRequired();
            entity.Property(x => x.Type).HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.Property(x => x.PriceAmount).HasPrecision(18, 2);
            entity.Property(x => x.Currency).HasMaxLength(8).IsRequired();
            entity.HasIndex(x => x.Code).IsUnique();
        });

        modelBuilder.Entity<BillingTransaction>(entity =>
        {
            entity.ToTable("BillingTransactions");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Amount).HasPrecision(18, 2);
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.Property(x => x.ExternalPaymentId).HasMaxLength(128).IsRequired();
            entity.Property(x => x.CheckoutUrl).HasMaxLength(512).IsRequired();
            entity.Property(x => x.Currency).HasMaxLength(8).IsRequired();
            entity.Property(x => x.FailureReason).HasMaxLength(512).IsRequired();
            entity.HasIndex(x => x.ExternalPaymentId).IsUnique();
            entity.HasIndex(x => new { x.UserId, x.CreatedAtUtc });
            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Plan)
                .WithMany()
                .HasForeignKey(x => x.PlanId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<DeliveryLog>(entity =>
        {
            entity.ToTable("DeliveryLogs");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Channel).HasConversion<string>().HasMaxLength(16).IsRequired();
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(16).IsRequired();
            entity.Property(x => x.Recipient).HasMaxLength(320).IsRequired();
            entity.Property(x => x.Subject).HasMaxLength(256).IsRequired();
            entity.Property(x => x.ProviderMessageId).HasMaxLength(128).IsRequired();
            entity.Property(x => x.ErrorMessage).HasMaxLength(512).IsRequired();
            entity.HasIndex(x => new { x.EventId, x.CreatedAtUtc });
            entity.HasOne(x => x.Event)
                .WithMany()
                .HasForeignKey(x => x.EventId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Guest)
                .WithMany()
                .HasForeignKey(x => x.GuestId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Template)
                .WithMany()
                .HasForeignKey(x => x.TemplateId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Event>(entity =>
        {
            entity.ToTable("Events");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).HasMaxLength(200).IsRequired();
            entity.Property(x => x.OccasionType).HasMaxLength(64).IsRequired();
            entity.Property(x => x.Venue).HasMaxLength(256).IsRequired();
            entity.Property(x => x.Address).HasMaxLength(512).IsRequired();
            entity.Property(x => x.TimeZone).HasMaxLength(64).IsRequired();
            entity.Property(x => x.DefaultLanguage).HasMaxLength(16).IsRequired();
            entity.HasIndex(x => new { x.OwnerUserId, x.ScheduledAtUtc });
            entity.HasOne(x => x.OwnerUser)
                .WithMany()
                .HasForeignKey(x => x.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<InvitationTemplate>(entity =>
        {
            entity.ToTable("InvitationTemplates");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(128).IsRequired();
            entity.Property(x => x.Channel).HasConversion<string>().HasMaxLength(16).IsRequired();
            entity.Property(x => x.Language).HasMaxLength(16).IsRequired();
            entity.Property(x => x.SubjectTemplate).HasMaxLength(256).IsRequired();
            entity.Property(x => x.BodyTemplate).HasMaxLength(4000).IsRequired();
            entity.HasIndex(x => new { x.OwnerUserId, x.Channel, x.Language });
            entity.HasOne(x => x.OwnerUser)
                .WithMany()
                .HasForeignKey(x => x.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Guest>(entity =>
        {
            entity.ToTable("Guests");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.FullName).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(320);
            entity.Property(x => x.PhoneNumber).HasMaxLength(32);
            entity.Property(x => x.PreferredLanguage).HasMaxLength(16).IsRequired();
            entity.Property(x => x.RsvpStatus).HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.HasIndex(x => x.EventId);
            entity.HasIndex(x => new { x.EventId, x.Email });
            entity.HasOne(x => x.Event)
                .WithMany(x => x.Guests)
                .HasForeignKey(x => x.EventId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Invitation>(entity =>
        {
            entity.ToTable("Invitations");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.PublicCode).HasMaxLength(64).IsRequired();
            entity.Property(x => x.ScanCode).HasMaxLength(64).IsRequired();
            entity.HasIndex(x => x.PublicCode).IsUnique();
            entity.HasIndex(x => x.ScanCode).IsUnique();
            entity.HasIndex(x => x.EventId);
            entity.HasIndex(x => x.GuestId).IsUnique();
            entity.HasOne(x => x.Event)
                .WithMany()
                .HasForeignKey(x => x.EventId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Guest)
                .WithOne(x => x.Invitation)
                .HasForeignKey<Invitation>(x => x.GuestId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Email).HasMaxLength(320).IsRequired();
            entity.Property(x => x.PasswordHash).IsRequired();
            entity.Property(x => x.PreferredLanguage).HasMaxLength(16).IsRequired();
            entity.Property(x => x.Role).HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<UserEntitlement>(entity =>
        {
            entity.ToTable("UserEntitlements");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.UserId).IsUnique();
            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<VerificationToken>(entity =>
        {
            entity.ToTable("VerificationTokens");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.TokenHash).HasMaxLength(128).IsRequired();
            entity.Property(x => x.Type).HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.HasIndex(x => x.TokenHash).IsUnique();
            entity.HasOne(x => x.User)
                .WithMany(x => x.VerificationTokens)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RefreshSession>(entity =>
        {
            entity.ToTable("RefreshSessions");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.TokenHash).HasMaxLength(128).IsRequired();
            entity.Property(x => x.RevokedReason).HasMaxLength(256);
            entity.HasIndex(x => x.TokenHash).IsUnique();
            entity.HasIndex(x => new { x.UserId, x.RevokedAtUtc });
            entity.HasOne(x => x.User)
                .WithMany(x => x.RefreshSessions)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}