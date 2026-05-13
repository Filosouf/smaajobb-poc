using Microsoft.EntityFrameworkCore;
using SmaaJobb.Api.Data;
using SmaaJobb.Api.Domain.Entities;
using SmaaJobb.Api.Messages.Dtos;

namespace SmaaJobb.Api.Messages;

public interface IMessageService
{
    Task<IReadOnlyList<MessageDto>> ListForJobAsync(Guid jobId, Guid currentUserId, CancellationToken ct);
    Task<MessageDto> SendAsync(Guid jobId, Guid senderId, string body, CancellationToken ct);
}

public class MessageService : IMessageService
{
    private readonly AppDbContext _db;

    public MessageService(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<MessageDto>> ListForJobAsync(Guid jobId, Guid currentUserId, CancellationToken ct)
    {
        var job = await _db.JobListings.FirstOrDefaultAsync(j => j.Id == jobId, ct)
            ?? throw new KeyNotFoundException();
        EnsureParticipant(job, currentUserId);

        return await _db.Messages
            .Where(m => m.JobListingId == jobId)
            .Include(m => m.Sender)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new MessageDto(
                m.Id, m.JobListingId, m.SenderId, m.Sender!.FullName,
                m.ReceiverId, m.Body, m.CreatedAt, m.ReadAt))
            .ToListAsync(ct);
    }

    public async Task<MessageDto> SendAsync(Guid jobId, Guid senderId, string body, CancellationToken ct)
    {
        var job = await _db.JobListings.FirstOrDefaultAsync(j => j.Id == jobId, ct)
            ?? throw new KeyNotFoundException();
        EnsureParticipant(job, senderId);

        var receiverId = job.ListerId == senderId
            ? job.AssignedToId
            : job.ListerId;
        if (receiverId is null)
            throw new InvalidOperationException("Ingen mottaker — jobben må være tildelt før meldinger kan sendes.");

        var msg = new Message
        {
            Id = Guid.NewGuid(),
            JobListingId = jobId,
            SenderId = senderId,
            ReceiverId = receiverId.Value,
            Body = body.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.Messages.Add(msg);
        await _db.SaveChangesAsync(ct);

        await _db.Entry(msg).Reference(m => m.Sender).LoadAsync(ct);

        return new MessageDto(
            msg.Id, msg.JobListingId, msg.SenderId, msg.Sender!.FullName,
            msg.ReceiverId, msg.Body, msg.CreatedAt, msg.ReadAt);
    }

    private static void EnsureParticipant(JobListing job, Guid userId)
    {
        var isLister = job.ListerId == userId;
        var isAssigned = job.AssignedToId == userId;
        if (!isLister && !isAssigned)
            throw new UnauthorizedAccessException();
    }
}
