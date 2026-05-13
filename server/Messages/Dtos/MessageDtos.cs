using System.ComponentModel.DataAnnotations;

namespace SmaaJobb.Api.Messages.Dtos;

public record MessageDto(
    Guid Id,
    Guid JobListingId,
    Guid SenderId,
    string SenderName,
    Guid ReceiverId,
    string Body,
    DateTime CreatedAt,
    DateTime? ReadAt);

public record SendMessageRequest(
    [Required, MinLength(1), MaxLength(4000)] string Body);
