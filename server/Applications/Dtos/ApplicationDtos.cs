using System.ComponentModel.DataAnnotations;
using SmaaJobb.Api.Domain;

namespace SmaaJobb.Api.Applications.Dtos;

public record ApplicationDto(
    Guid Id,
    Guid JobListingId,
    string JobTitle,
    JobStatus JobStatus,
    Guid WorkerId,
    string WorkerName,
    decimal? WorkerAverageRating,
    int WorkerCompletedJobs,
    string Message,
    ApplicationStatus Status,
    DateTime CreatedAt);

public record CreateApplicationRequest(
    [Required, MinLength(5), MaxLength(2000)] string Message);
