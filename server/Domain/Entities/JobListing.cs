namespace SmaaJobb.Api.Domain.Entities;

public class JobListing
{
    public Guid Id { get; set; }

    public Guid ListerId { get; set; }
    public AppUser? Lister { get; set; }

    public int CategoryId { get; set; }
    public JobCategory? Category { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public PriceModel PriceModel { get; set; }
    public decimal Price { get; set; }
    public decimal EstimatedHours { get; set; }
    public decimal PlatformFee { get; set; }

    public DeadlineType DeadlineType { get; set; }
    public DateTime? DeadlineDate { get; set; }
    public int? DeadlineDays { get; set; }

    public string PostalCode { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;

    public JobStatus Status { get; set; } = JobStatus.Draft;

    public Guid? AssignedToId { get; set; }
    public AppUser? AssignedTo { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedAt { get; set; }
    public DateTime? AssignedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    public List<JobImage> Images { get; set; } = new();
    public List<JobApplication> Applications { get; set; } = new();
    public List<Message> Messages { get; set; } = new();
    public List<Rating> Ratings { get; set; } = new();
}
