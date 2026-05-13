namespace SmaaJobb.Api.Domain.Entities;

public class Message
{
    public Guid Id { get; set; }

    public Guid JobListingId { get; set; }
    public JobListing? JobListing { get; set; }

    public Guid SenderId { get; set; }
    public AppUser? Sender { get; set; }

    public Guid ReceiverId { get; set; }
    public AppUser? Receiver { get; set; }

    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }
}
