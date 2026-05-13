namespace SmaaJobb.Api.Domain.Entities;

public class GuardianRelationship
{
    public Guid Id { get; set; }
    public Guid GuardianId { get; set; }
    public AppUser? Guardian { get; set; }
    public Guid ChildId { get; set; }
    public AppUser? Child { get; set; }
    public bool AutoApprove { get; set; }
    public GuardianRelationshipStatus Status { get; set; } = GuardianRelationshipStatus.Pending;
    public DateTime? ConsentedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
