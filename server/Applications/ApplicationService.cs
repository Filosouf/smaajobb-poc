using Microsoft.EntityFrameworkCore;
using SmaaJobb.Api.Applications.Dtos;
using SmaaJobb.Api.Data;
using SmaaJobb.Api.Domain;
using SmaaJobb.Api.Domain.Entities;

namespace SmaaJobb.Api.Applications;

public interface IApplicationService
{
    Task<IReadOnlyList<ApplicationDto>> ListForJobAsync(Guid jobId, Guid currentUserId, CancellationToken ct);
    Task<IReadOnlyList<ApplicationDto>> ListMineAsync(Guid workerId, CancellationToken ct);
    Task<ApplicationDto> ApplyAsync(Guid jobId, Guid workerId, string message, CancellationToken ct);
    Task<ApplicationDto> AcceptAsync(Guid appId, Guid listerId, CancellationToken ct);
    Task<ApplicationDto> RejectAsync(Guid appId, Guid listerId, CancellationToken ct);
    Task<ApplicationDto> WithdrawAsync(Guid appId, Guid workerId, CancellationToken ct);
}

public class ApplicationService : IApplicationService
{
    private readonly AppDbContext _db;

    public ApplicationService(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<ApplicationDto>> ListForJobAsync(Guid jobId, Guid currentUserId, CancellationToken ct)
    {
        var job = await _db.JobListings.FirstOrDefaultAsync(j => j.Id == jobId, ct)
            ?? throw new KeyNotFoundException();
        if (job.ListerId != currentUserId)
            throw new UnauthorizedAccessException();

        return await _db.JobApplications
            .Where(a => a.JobListingId == jobId)
            .Include(a => a.Worker)
            .Include(a => a.JobListing)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => ToDto(a))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<ApplicationDto>> ListMineAsync(Guid workerId, CancellationToken ct)
    {
        return await _db.JobApplications
            .Where(a => a.WorkerId == workerId)
            .Include(a => a.Worker)
            .Include(a => a.JobListing)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => ToDto(a))
            .ToListAsync(ct);
    }

    public async Task<ApplicationDto> ApplyAsync(Guid jobId, Guid workerId, string message, CancellationToken ct)
    {
        var job = await _db.JobListings.FirstOrDefaultAsync(j => j.Id == jobId, ct)
            ?? throw new KeyNotFoundException();

        if (job.ListerId == workerId)
            throw new InvalidOperationException("Du kan ikke søke på din egen jobb.");
        if (job.Status != JobStatus.Open)
            throw new InvalidOperationException("Jobben er ikke åpen for søknader.");

        var existing = await _db.JobApplications
            .FirstOrDefaultAsync(a => a.JobListingId == jobId && a.WorkerId == workerId, ct);
        if (existing is not null)
            throw new InvalidOperationException("Du har allerede søkt på denne jobben.");

        var app = new JobApplication
        {
            Id = Guid.NewGuid(),
            JobListingId = jobId,
            WorkerId = workerId,
            Message = message.Trim(),
            Status = ApplicationStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _db.JobApplications.Add(app);
        await _db.SaveChangesAsync(ct);

        return await LoadDtoAsync(app.Id, ct);
    }

    public async Task<ApplicationDto> AcceptAsync(Guid appId, Guid listerId, CancellationToken ct)
    {
        var app = await _db.JobApplications
            .Include(a => a.JobListing)
            .FirstOrDefaultAsync(a => a.Id == appId, ct)
            ?? throw new KeyNotFoundException();

        if (app.JobListing!.ListerId != listerId)
            throw new UnauthorizedAccessException();
        if (app.JobListing.Status != JobStatus.Open)
            throw new InvalidOperationException("Jobben kan ikke tildeles i nåværende status.");
        if (app.Status != ApplicationStatus.Pending)
            throw new InvalidOperationException("Søknaden er ikke aktiv.");

        app.Status = ApplicationStatus.Accepted;
        app.JobListing.Status = JobStatus.Assigned;
        app.JobListing.AssignedToId = app.WorkerId;
        app.JobListing.AssignedAt = DateTime.UtcNow;

        // Auto-avvis alle andre Pending-søknader
        var others = await _db.JobApplications
            .Where(a => a.JobListingId == app.JobListingId
                && a.Id != app.Id
                && a.Status == ApplicationStatus.Pending)
            .ToListAsync(ct);
        foreach (var o in others)
            o.Status = ApplicationStatus.Rejected;

        await _db.SaveChangesAsync(ct);
        return await LoadDtoAsync(app.Id, ct);
    }

    public async Task<ApplicationDto> RejectAsync(Guid appId, Guid listerId, CancellationToken ct)
    {
        var app = await _db.JobApplications
            .Include(a => a.JobListing)
            .FirstOrDefaultAsync(a => a.Id == appId, ct)
            ?? throw new KeyNotFoundException();

        if (app.JobListing!.ListerId != listerId)
            throw new UnauthorizedAccessException();
        if (app.Status != ApplicationStatus.Pending)
            throw new InvalidOperationException("Søknaden er ikke aktiv.");

        app.Status = ApplicationStatus.Rejected;
        await _db.SaveChangesAsync(ct);
        return await LoadDtoAsync(app.Id, ct);
    }

    public async Task<ApplicationDto> WithdrawAsync(Guid appId, Guid workerId, CancellationToken ct)
    {
        var app = await _db.JobApplications
            .Include(a => a.JobListing)
            .FirstOrDefaultAsync(a => a.Id == appId, ct)
            ?? throw new KeyNotFoundException();

        if (app.WorkerId != workerId)
            throw new UnauthorizedAccessException();
        if (app.Status != ApplicationStatus.Pending)
            throw new InvalidOperationException("Bare ventende søknader kan trekkes.");

        app.Status = ApplicationStatus.Withdrawn;
        await _db.SaveChangesAsync(ct);
        return await LoadDtoAsync(app.Id, ct);
    }

    private async Task<ApplicationDto> LoadDtoAsync(Guid appId, CancellationToken ct)
    {
        var app = await _db.JobApplications
            .Include(a => a.Worker)
            .Include(a => a.JobListing)
            .FirstAsync(a => a.Id == appId, ct);
        return ToDto(app);
    }

    private static ApplicationDto ToDto(JobApplication a) => new(
        a.Id,
        a.JobListingId,
        a.JobListing!.Title,
        a.JobListing.Status,
        a.WorkerId,
        a.Worker!.FullName,
        a.Worker.AverageRating,
        a.Worker.CompletedJobs,
        a.Message,
        a.Status,
        a.CreatedAt);
}
