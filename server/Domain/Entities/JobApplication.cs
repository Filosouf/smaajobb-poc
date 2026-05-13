namespace SmaaJobb.Api.Domain.Entities;

public class JobApplication
{
    public Guid Id { get; set; }

    public Guid JobListingId { get; set; }
    public JobListing? JobListing { get; set; }

    public Guid WorkerId { get; set; }
    public AppUser? Worker { get; set; }

    public string Message { get; set; } = string.Empty;
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;

    public DateTime? GuardianApprovedAt { get; set; }
    public Guid? GuardianApprovedById { get; set; }
    public AppUser? GuardianApprovedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
