using System.ComponentModel.DataAnnotations;

namespace SmaaJobb.Api.Ratings.Dtos;

public record RatingDto(
    Guid Id,
    Guid JobListingId,
    string JobTitle,
    Guid FromId,
    string FromName,
    Guid ToId,
    int Score,
    string? Comment,
    DateTime CreatedAt);

public record CreateRatingRequest(
    [Range(1, 5)] int Score,
    [MaxLength(2000)] string? Comment);

public record JobRatingsDto(
    RatingDto? ListerToWorker,
    RatingDto? WorkerToLister,
    bool CanRateAsLister,
    bool CanRateAsWorker);
