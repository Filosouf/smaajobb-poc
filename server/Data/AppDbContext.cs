using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SmaaJobb.Api.Domain.Entities;

namespace SmaaJobb.Api.Data;

public class AppDbContext : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<GuardianRelationship> GuardianRelationships => Set<GuardianRelationship>();
    public DbSet<JobCategory> JobCategories => Set<JobCategory>();
    public DbSet<JobListing> JobListings => Set<JobListing>();
    public DbSet<JobImage> JobImages => Set<JobImage>();
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Rating> Ratings => Set<Rating>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<WorkTimeLog> WorkTimeLogs => Set<WorkTimeLog>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PostalCode> PostalCodes => Set<PostalCode>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<AppUser>(e =>
        {
            e.Property(u => u.FullName).HasMaxLength(200).IsRequired();
            e.Property(u => u.PostalCode).HasMaxLength(10);
            e.Property(u => u.AverageRating).HasPrecision(3, 2);
        });

        builder.Entity<GuardianRelationship>(e =>
        {
            e.HasOne(g => g.Guardian)
                .WithMany()
                .HasForeignKey(g => g.GuardianId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(g => g.Child)
                .WithMany()
                .HasForeignKey(g => g.ChildId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(g => new { g.GuardianId, g.ChildId }).IsUnique();
        });

        builder.Entity<JobCategory>(e =>
        {
            e.Property(c => c.Slug).HasMaxLength(64).IsRequired();
            e.Property(c => c.Name).HasMaxLength(120).IsRequired();
            e.Property(c => c.Description).HasMaxLength(500);
            e.HasIndex(c => c.Slug).IsUnique();
        });

        builder.Entity<JobListing>(e =>
        {
            e.Property(j => j.Title).HasMaxLength(200).IsRequired();
            e.Property(j => j.Description).HasMaxLength(4000).IsRequired();
            e.Property(j => j.Price).HasPrecision(10, 2);
            e.Property(j => j.PlatformFee).HasPrecision(10, 2);
            e.Property(j => j.EstimatedHours).HasPrecision(6, 2);
            e.Property(j => j.PostalCode).HasMaxLength(10).IsRequired();
            e.Property(j => j.City).HasMaxLength(120);

            e.HasOne(j => j.Lister)
                .WithMany()
                .HasForeignKey(j => j.ListerId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(j => j.AssignedTo)
                .WithMany()
                .HasForeignKey(j => j.AssignedToId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(j => j.Category)
                .WithMany()
                .HasForeignKey(j => j.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(j => new { j.Status, j.CategoryId, j.PostalCode });
            e.HasIndex(j => j.ListerId);
        });

        builder.Entity<JobImage>(e =>
        {
            e.Property(i => i.BlobKey).HasMaxLength(500).IsRequired();
            e.HasOne(i => i.JobListing)
                .WithMany(j => j.Images)
                .HasForeignKey(i => i.JobListingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<JobApplication>(e =>
        {
            e.Property(a => a.Message).HasMaxLength(2000);

            e.HasOne(a => a.JobListing)
                .WithMany(j => j.Applications)
                .HasForeignKey(a => a.JobListingId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(a => a.Worker)
                .WithMany()
                .HasForeignKey(a => a.WorkerId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.GuardianApprovedBy)
                .WithMany()
                .HasForeignKey(a => a.GuardianApprovedById)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(a => new { a.JobListingId, a.WorkerId }).IsUnique();
        });

        builder.Entity<Message>(e =>
        {
            e.Property(m => m.Body).HasMaxLength(4000).IsRequired();

            e.HasOne(m => m.JobListing)
                .WithMany(j => j.Messages)
                .HasForeignKey(m => m.JobListingId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(m => m.Receiver)
                .WithMany()
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(m => new { m.JobListingId, m.CreatedAt });
        });

        builder.Entity<Rating>(e =>
        {
            e.Property(r => r.Comment).HasMaxLength(2000);

            e.HasOne(r => r.JobListing)
                .WithMany(j => j.Ratings)
                .HasForeignKey(r => r.JobListingId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(r => r.From)
                .WithMany()
                .HasForeignKey(r => r.FromId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.To)
                .WithMany()
                .HasForeignKey(r => r.ToId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(r => new { r.JobListingId, r.FromId }).IsUnique();
            e.HasIndex(r => new { r.ToId, r.CreatedAt });
        });

        builder.Entity<Payment>(e =>
        {
            e.Property(p => p.StripeSessionId).HasMaxLength(255).IsRequired();
            e.Property(p => p.StripePaymentIntentId).HasMaxLength(255);
            e.Property(p => p.Currency).HasMaxLength(3).IsRequired();
            e.Property(p => p.Amount).HasPrecision(10, 2);
            e.Property(p => p.PlatformFee).HasPrecision(10, 2);

            e.HasOne(p => p.JobListing)
                .WithMany()
                .HasForeignKey(p => p.JobListingId)
                .OnDelete(DeleteBehavior.SetNull);

            e.HasIndex(p => p.StripeSessionId).IsUnique();
        });

        builder.Entity<WorkTimeLog>(e =>
        {
            e.Property(w => w.HoursWorked).HasPrecision(6, 2);

            e.HasOne(w => w.JobListing)
                .WithMany()
                .HasForeignKey(w => w.JobListingId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(w => w.Worker)
                .WithMany()
                .HasForeignKey(w => w.WorkerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<RefreshToken>(e =>
        {
            e.Property(r => r.TokenHash).HasMaxLength(255).IsRequired();

            e.HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(r => r.TokenHash).IsUnique();
            e.HasIndex(r => r.UserId);
        });

        builder.Entity<PostalCode>(e =>
        {
            e.HasKey(p => p.Code);
            e.Property(p => p.Code).HasMaxLength(10);
            e.Property(p => p.City).HasMaxLength(120).IsRequired();
            e.Property(p => p.Municipality).HasMaxLength(120);
            e.Property(p => p.County).HasMaxLength(120);
        });
    }
}
