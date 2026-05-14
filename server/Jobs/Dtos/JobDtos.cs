using System.ComponentModel.DataAnnotations;
using SmaaJobb.Api.Domain;

namespace SmaaJobb.Api.Jobs.Dtos;

public record CategoryDto(
    int Id,
    string Slug,
    string Name,
    string Description,
    int MinAge,
    bool AdultsOnly);

public record PersonRef(
    Guid Id,
    string FullName,
    decimal? AverageRating,
    int CompletedJobs);

public record JobListItem(
    Guid Id,
    string Title,
    int CategoryId,
    string CategoryName,
    PriceModel PriceModel,
    decimal Price,
    decimal EstimatedHours,
    string PostalCode,
    string City,
    JobStatus Status,
    DateTime? PublishedAt,
    string? PrimaryImageUrl);

public record JobImageDto(Guid Id, string Url, int DisplayOrder);

public record JobDetail(
    Guid Id,
    PersonRef Lister,
    int CategoryId,
    string CategoryName,
    string Title,
    string Description,
    PriceModel PriceModel,
    decimal Price,
    decimal EstimatedHours,
    decimal PlatformFee,
    DeadlineType DeadlineType,
    DateTime? DeadlineDate,
    int? DeadlineDays,
    string PostalCode,
    string City,
    JobStatus Status,
    PersonRef? AssignedTo,
    DateTime CreatedAt,
    DateTime? PublishedAt,
    DateTime? AssignedAt,
    DateTime? CompletedAt,
    IReadOnlyList<JobImageDto> Images);

public record CreateJobRequest(
    [Required] int CategoryId,
    [Required, MinLength(3), MaxLength(200)] string Title,
    [Required, MinLength(10), MaxLength(4000)] string Description,
    [Required] PriceModel PriceModel,
    [Range(1, 1_000_000)] decimal Price,
    [Range(0.1, 1000)] decimal EstimatedHours,
    [Required] DeadlineType DeadlineType,
    DateTime? DeadlineDate,
    [Range(1, 365)] int? DeadlineDays,
    [Required, RegularExpression(@"^\d{4}$", ErrorMessage = "Postnummer må være 4 siffer.")] string PostalCode,
    IReadOnlyList<string>? ImageBlobKeys);

public record UpdateJobRequest(
    [Required] int CategoryId,
    [Required, MinLength(3), MaxLength(200)] string Title,
    [Required, MinLength(10), MaxLength(4000)] string Description,
    [Required] PriceModel PriceModel,
    [Range(1, 1_000_000)] decimal Price,
    [Range(0.1, 1000)] decimal EstimatedHours,
    [Required] DeadlineType DeadlineType,
    DateTime? DeadlineDate,
    [Range(1, 365)] int? DeadlineDays,
    [Required, RegularExpression(@"^\d{4}$")] string PostalCode,
    IReadOnlyList<string>? ImageBlobKeys);

public record JobFilter(
    int? CategoryId,
    string? PostalCode,
    decimal? MinPrice,
    decimal? MaxPrice,
    JobStatus? Status,
    bool MineOnly);

public record PublishResponseDto(JobDetail Job, string? CheckoutUrl);
