namespace SmaaJobb.Api.Domain.Entities;

public class JobImage
{
    public Guid Id { get; set; }
    public Guid JobListingId { get; set; }
    public JobListing? JobListing { get; set; }
    public string BlobKey { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}
