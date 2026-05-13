namespace SmaaJobb.Api.Domain.Entities;

public class WorkTimeLog
{
    public Guid Id { get; set; }

    public Guid JobListingId { get; set; }
    public JobListing? JobListing { get; set; }

    public Guid WorkerId { get; set; }
    public AppUser? Worker { get; set; }

    public decimal HoursWorked { get; set; }
    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
    public bool OverLimit { get; set; }
}
