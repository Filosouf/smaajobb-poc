namespace SmaaJobb.Api.Domain.Entities;

public class Rating
{
    public Guid Id { get; set; }

    public Guid JobListingId { get; set; }
    public JobListing? JobListing { get; set; }

    public Guid FromId { get; set; }
    public AppUser? From { get; set; }

    public Guid ToId { get; set; }
    public AppUser? To { get; set; }

    public int Score { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
