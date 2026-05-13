using Microsoft.EntityFrameworkCore;
using SmaaJobb.Api.Data;
using SmaaJobb.Api.Domain;
using SmaaJobb.Api.Domain.Entities;
using SmaaJobb.Api.Ratings.Dtos;

namespace SmaaJobb.Api.Ratings;

public interface IRatingService
{
    Task<RatingDto> RateAsync(Guid jobId, Guid fromUserId, int score, string? comment, CancellationToken ct);
    Task<JobRatingsDto> GetForJobAsync(Guid jobId, Guid? currentUserId, CancellationToken ct);
    Task<IReadOnlyList<RatingDto>> ListForUserAsync(Guid userId, CancellationToken ct);
}

public class RatingService : IRatingService
{
    private readonly AppDbContext _db;

    public RatingService(AppDbContext db) => _db = db;

    public async Task<RatingDto> RateAsync(Guid jobId, Guid fromUserId, int score, string? comment, CancellationToken ct)
    {
        var job = await _db.JobListings.FirstOrDefaultAsync(j => j.Id == jobId, ct)
            ?? throw new KeyNotFoundException();

        if (job.Status != JobStatus.Completed)
            throw new InvalidOperationException("Du kan bare gi rating på fullførte jobber.");

        Guid toUserId;
        if (job.ListerId == fromUserId && job.AssignedToId is { } w)
            toUserId = w;
        else if (job.AssignedToId == fromUserId)
            toUserId = job.ListerId;
        else
            throw new UnauthorizedAccessException();

        var existing = await _db.Ratings
            .FirstOrDefaultAsync(r => r.JobListingId == jobId && r.FromId == fromUserId, ct);
        if (existing is not null)
            throw new InvalidOperationException("Du har allerede gitt rating for denne jobben.");

        var rating = new Rating
        {
            Id = Guid.NewGuid(),
            JobListingId = jobId,
            FromId = fromUserId,
            ToId = toUserId,
            Score = score,
            Comment = string.IsNullOrWhiteSpace(comment) ? null : comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.Ratings.Add(rating);
        await _db.SaveChangesAsync(ct);

        await RecalculateAverageAsync(toUserId, ct);

        return await LoadDtoAsync(rating.Id, ct);
    }

    public async Task<JobRatingsDto> GetForJobAsync(Guid jobId, Guid? currentUserId, CancellationToken ct)
    {
        var job = await _db.JobListings.FirstOrDefaultAsync(j => j.Id == jobId, ct)
            ?? throw new KeyNotFoundException();

        var ratings = await _db.Ratings
            .Where(r => r.JobListingId == jobId)
            .Include(r => r.From)
            .Include(r => r.JobListing)
            .ToListAsync(ct);

        RatingDto? listerToWorker = null;
        RatingDto? workerToLister = null;

        foreach (var r in ratings)
        {
            var dto = ToDto(r);
            if (r.FromId == job.ListerId) listerToWorker = dto;
            else if (r.FromId == job.AssignedToId) workerToLister = dto;
        }

        var canRateAsLister = currentUserId == job.ListerId
            && job.Status == JobStatus.Completed
            && listerToWorker is null
            && job.AssignedToId is not null;
        var canRateAsWorker = currentUserId == job.AssignedToId
            && job.Status == JobStatus.Completed
            && workerToLister is null;

        return new JobRatingsDto(listerToWorker, workerToLister, canRateAsLister, canRateAsWorker);
    }

    public async Task<IReadOnlyList<RatingDto>> ListForUserAsync(Guid userId, CancellationToken ct)
    {
        return await _db.Ratings
            .Where(r => r.ToId == userId)
            .Include(r => r.From)
            .Include(r => r.JobListing)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => ToDto(r))
            .ToListAsync(ct);
    }

    private async Task RecalculateAverageAsync(Guid userId, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null) return;

        var scores = await _db.Ratings
            .Where(r => r.ToId == userId)
            .Select(r => (decimal)r.Score)
            .ToListAsync(ct);

        user.AverageRating = scores.Count > 0
            ? Math.Round(scores.Average(), 2)
            : null;

        await _db.SaveChangesAsync(ct);
    }

    private async Task<RatingDto> LoadDtoAsync(Guid id, CancellationToken ct)
    {
        var r = await _db.Ratings
            .Include(r => r.From)
            .Include(r => r.JobListing)
            .FirstAsync(r => r.Id == id, ct);
        return ToDto(r);
    }

    private static RatingDto ToDto(Rating r) => new(
        r.Id,
        r.JobListingId,
        r.JobListing!.Title,
        r.FromId,
        r.From!.FullName,
        r.ToId,
        r.Score,
        r.Comment,
        r.CreatedAt);
}
