namespace SmaaJobb.Api.Domain.Entities;

public class Payment
{
    public Guid Id { get; set; }

    public Guid? JobListingId { get; set; }
    public JobListing? JobListing { get; set; }

    public string StripeSessionId { get; set; } = string.Empty;
    public string? StripePaymentIntentId { get; set; }

    public decimal Amount { get; set; }
    public decimal PlatformFee { get; set; }
    public string Currency { get; set; } = "NOK";

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
