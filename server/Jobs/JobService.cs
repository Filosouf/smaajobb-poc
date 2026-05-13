using Microsoft.EntityFrameworkCore;
using SmaaJobb.Api.Data;
using SmaaJobb.Api.Domain;
using SmaaJobb.Api.Domain.Entities;
using SmaaJobb.Api.Jobs.Dtos;
using SmaaJobb.Api.Payments;

namespace SmaaJobb.Api.Jobs;

public record PublishResult(JobDetail Job, string? CheckoutUrl);

public interface IJobService
{
    Task<IReadOnlyList<JobListItem>> SearchAsync(JobFilter filter, Guid? currentUserId, CancellationToken ct);
    Task<JobDetail?> GetAsync(Guid id, CancellationToken ct);
    Task<JobDetail> CreateAsync(Guid listerId, CreateJobRequest req, CancellationToken ct);
    Task<JobDetail> UpdateAsync(Guid id, Guid listerId, UpdateJobRequest req, CancellationToken ct);
    Task<PublishResult> PublishAsync(Guid id, Guid listerId, CancellationToken ct);
    Task<JobDetail> CancelAsync(Guid id, Guid listerId, CancellationToken ct);
    Task DeleteDraftAsync(Guid id, Guid listerId, CancellationToken ct);
    Task<JobDetail> MarkCompletedAsync(Guid id, Guid workerId, CancellationToken ct);
    Task<JobDetail> ConfirmCompletionAsync(Guid id, Guid listerId, CancellationToken ct);
}

public class JobService : IJobService
{
    private const decimal PlatformFeeRate = 0.05m;

    private readonly AppDbContext _db;
    private readonly IPaymentService _payments;

    public JobService(AppDbContext db, IPaymentService payments)
    {
        _db = db;
        _payments = payments;
    }

    public async Task<IReadOnlyList<JobListItem>> SearchAsync(JobFilter filter, Guid? currentUserId, CancellationToken ct)
    {
        var q = _db.JobListings
            .Include(j => j.Category)
            .AsQueryable();

        if (filter.MineOnly)
        {
            if (currentUserId is null) return [];
            q = q.Where(j => j.ListerId == currentUserId.Value);
        }
        else
        {
            // Default offentlig søk: kun publiserte
            q = q.Where(j => j.Status == JobStatus.Open);
        }

        if (filter.CategoryId is { } cat) q = q.Where(j => j.CategoryId == cat);
        if (!string.IsNullOrWhiteSpace(filter.PostalCode))
            q = q.Where(j => j.PostalCode.StartsWith(filter.PostalCode));
        if (filter.MinPrice is { } min) q = q.Where(j => j.Price >= min);
        if (filter.MaxPrice is { } max) q = q.Where(j => j.Price <= max);
        if (filter.Status is { } s && filter.MineOnly) q = q.Where(j => j.Status == s);

        return await q
            .OrderByDescending(j => j.PublishedAt ?? j.CreatedAt)
            .Select(j => new JobListItem(
                j.Id, j.Title, j.CategoryId, j.Category!.Name,
                j.PriceModel, j.Price, j.EstimatedHours,
                j.PostalCode, j.City, j.Status, j.PublishedAt))
            .ToListAsync(ct);
    }

    public async Task<JobDetail?> GetAsync(Guid id, CancellationToken ct)
    {
        var job = await _db.JobListings
            .Include(j => j.Category)
            .Include(j => j.Lister)
            .Include(j => j.AssignedTo)
            .FirstOrDefaultAsync(j => j.Id == id, ct);

        return job is null ? null : ToDetail(job);
    }

    public async Task<JobDetail> CreateAsync(Guid listerId, CreateJobRequest req, CancellationToken ct)
    {
        ValidateDeadline(req.DeadlineType, req.DeadlineDate, req.DeadlineDays);

        var category = await _db.JobCategories.FirstOrDefaultAsync(c => c.Id == req.CategoryId, ct)
            ?? throw new InvalidOperationException("Ukjent kategori.");

        var city = await ResolveCityAsync(req.PostalCode, ct);

        var job = new JobListing
        {
            Id = Guid.NewGuid(),
            ListerId = listerId,
            CategoryId = category.Id,
            Title = req.Title.Trim(),
            Description = req.Description.Trim(),
            PriceModel = req.PriceModel,
            Price = req.Price,
            EstimatedHours = req.EstimatedHours,
            DeadlineType = req.DeadlineType,
            DeadlineDate = req.DeadlineDate,
            DeadlineDays = req.DeadlineDays,
            PostalCode = req.PostalCode,
            City = city,
            Status = JobStatus.Draft,
            CreatedAt = DateTime.UtcNow,
        };

        _db.JobListings.Add(job);
        await _db.SaveChangesAsync(ct);

        return (await GetAsync(job.Id, ct))!;
    }

    public async Task<JobDetail> UpdateAsync(Guid id, Guid listerId, UpdateJobRequest req, CancellationToken ct)
    {
        var job = await _db.JobListings.FirstOrDefaultAsync(j => j.Id == id, ct)
            ?? throw new KeyNotFoundException();

        if (job.ListerId != listerId)
            throw new UnauthorizedAccessException();
        if (job.Status != JobStatus.Draft)
            throw new InvalidOperationException("Kun kladd kan endres.");

        ValidateDeadline(req.DeadlineType, req.DeadlineDate, req.DeadlineDays);

        var city = await ResolveCityAsync(req.PostalCode, ct);

        job.CategoryId = req.CategoryId;
        job.Title = req.Title.Trim();
        job.Description = req.Description.Trim();
        job.PriceModel = req.PriceModel;
        job.Price = req.Price;
        job.EstimatedHours = req.EstimatedHours;
        job.DeadlineType = req.DeadlineType;
        job.DeadlineDate = req.DeadlineDate;
        job.DeadlineDays = req.DeadlineDays;
        job.PostalCode = req.PostalCode;
        job.City = city;

        await _db.SaveChangesAsync(ct);
        return (await GetAsync(id, ct))!;
    }

    public async Task<PublishResult> PublishAsync(Guid id, Guid listerId, CancellationToken ct)
    {
        var job = await _db.JobListings
            .Include(j => j.Lister)
            .FirstOrDefaultAsync(j => j.Id == id, ct)
            ?? throw new KeyNotFoundException();

        if (job.ListerId != listerId)
            throw new UnauthorizedAccessException();
        if (job.Status != JobStatus.Draft && job.Status != JobStatus.AwaitingPayment)
            throw new InvalidOperationException("Kun kladd eller jobber som venter på betaling kan publiseres.");

        if (!_payments.IsConfigured)
            throw new InvalidOperationException(
                "Stripe er ikke konfigurert. Sett Stripe:SecretKey via dotnet user-secrets eller miljøvariabler.");

        var checkout = await _payments.CreatePublishCheckoutAsync(job, job.Lister!, ct);
        var detail = (await GetAsync(id, ct))!;
        return new PublishResult(detail, checkout.CheckoutUrl);
    }

    public async Task<JobDetail> CancelAsync(Guid id, Guid listerId, CancellationToken ct)
    {
        var job = await _db.JobListings.FirstOrDefaultAsync(j => j.Id == id, ct)
            ?? throw new KeyNotFoundException();

        if (job.ListerId != listerId)
            throw new UnauthorizedAccessException();
        if (job.Status is JobStatus.Completed or JobStatus.Cancelled)
            throw new InvalidOperationException("Jobben er allerede avsluttet.");

        job.Status = JobStatus.Cancelled;
        await _db.SaveChangesAsync(ct);
        return (await GetAsync(id, ct))!;
    }

    public async Task<JobDetail> MarkCompletedAsync(Guid id, Guid workerId, CancellationToken ct)
    {
        var job = await _db.JobListings.FirstOrDefaultAsync(j => j.Id == id, ct)
            ?? throw new KeyNotFoundException();

        if (job.AssignedToId != workerId)
            throw new UnauthorizedAccessException();
        if (job.Status != JobStatus.Assigned)
            throw new InvalidOperationException("Bare tildelte jobber kan markeres ferdig.");

        job.Status = JobStatus.AwaitingConfirmation;
        await _db.SaveChangesAsync(ct);
        return (await GetAsync(id, ct))!;
    }

    public async Task<JobDetail> ConfirmCompletionAsync(Guid id, Guid listerId, CancellationToken ct)
    {
        var job = await _db.JobListings
            .Include(j => j.Lister)
            .Include(j => j.AssignedTo)
            .FirstOrDefaultAsync(j => j.Id == id, ct)
            ?? throw new KeyNotFoundException();

        if (job.ListerId != listerId)
            throw new UnauthorizedAccessException();
        if (job.Status != JobStatus.AwaitingConfirmation)
            throw new InvalidOperationException("Jobben venter ikke på bekreftelse.");

        job.Status = JobStatus.Completed;
        job.CompletedAt = DateTime.UtcNow;

        // Inkrementer CompletedJobs på begge parter
        if (job.Lister is not null) job.Lister.CompletedJobs += 1;
        if (job.AssignedTo is not null) job.AssignedTo.CompletedJobs += 1;

        await _db.SaveChangesAsync(ct);
        return (await GetAsync(id, ct))!;
    }

    public async Task DeleteDraftAsync(Guid id, Guid listerId, CancellationToken ct)
    {
        var job = await _db.JobListings.FirstOrDefaultAsync(j => j.Id == id, ct)
            ?? throw new KeyNotFoundException();

        if (job.ListerId != listerId)
            throw new UnauthorizedAccessException();
        if (job.Status != JobStatus.Draft)
            throw new InvalidOperationException("Kun kladd kan slettes.");

        _db.JobListings.Remove(job);
        await _db.SaveChangesAsync(ct);
    }

    private static void ValidateDeadline(DeadlineType type, DateTime? date, int? days)
    {
        switch (type)
        {
            case DeadlineType.ByDate when date is null:
                throw new InvalidOperationException("DeadlineDate kreves når DeadlineType = ByDate.");
            case DeadlineType.ByDate when date <= DateTime.UtcNow:
                throw new InvalidOperationException("DeadlineDate må være i fremtiden.");
            case DeadlineType.WithinDays when days is null:
                throw new InvalidOperationException("DeadlineDays kreves når DeadlineType = WithinDays.");
        }
    }

    private async Task<string> ResolveCityAsync(string postalCode, CancellationToken ct)
    {
        var entry = await _db.PostalCodes.FirstOrDefaultAsync(p => p.Code == postalCode, ct);
        return entry?.City ?? string.Empty;
    }

    private static JobDetail ToDetail(JobListing j) => new(
        j.Id,
        new PersonRef(j.Lister!.Id, j.Lister.FullName, j.Lister.AverageRating, j.Lister.CompletedJobs),
        j.CategoryId,
        j.Category!.Name,
        j.Title,
        j.Description,
        j.PriceModel,
        j.Price,
        j.EstimatedHours,
        j.PlatformFee,
        j.DeadlineType,
        j.DeadlineDate,
        j.DeadlineDays,
        j.PostalCode,
        j.City,
        j.Status,
        j.AssignedTo is null
            ? null
            : new PersonRef(j.AssignedTo.Id, j.AssignedTo.FullName, j.AssignedTo.AverageRating, j.AssignedTo.CompletedJobs),
        j.CreatedAt,
        j.PublishedAt,
        j.AssignedAt,
        j.CompletedAt);
}
