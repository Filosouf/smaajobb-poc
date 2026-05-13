using Microsoft.AspNetCore.Identity;

namespace SmaaJobb.Api.Domain.Entities;

public class AppUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;
    public DateOnly BirthDate { get; set; }
    public string? PostalCode { get; set; }
    public UserType UserType { get; set; } = UserType.Adult;
    public bool IsGuardian { get; set; }
    public VerifyStatus VerifyStatus { get; set; } = VerifyStatus.Unverified;
    public decimal? AverageRating { get; set; }
    public int CompletedJobs { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
