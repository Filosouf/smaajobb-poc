using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SmaaJobb.Api.Data;
using SmaaJobb.Api.Domain;
using SmaaJobb.Api.Domain.Entities;
using SmaaJobb.Api.Email;
using Stripe;
using Stripe.Checkout;

namespace SmaaJobb.Api.Payments;

public record PublishCheckout(string SessionId, string CheckoutUrl);

public interface IPaymentService
{
    bool IsConfigured { get; }

    Task<PublishCheckout> CreatePublishCheckoutAsync(
        JobListing job,
        AppUser lister,
        CancellationToken ct);

    /// <summary>
    /// Slår opp en Stripe-session, og hvis betalt: oppdaterer Payment + setter
    /// jobben Open. Idempotent — trygt å kalle flere ganger.
    /// </summary>
    Task<bool> ReconcileSessionAsync(string sessionId, CancellationToken ct);

    /// <summary>
    /// Håndterer en allerede signaturverifisert Stripe-event.
    /// </summary>
    Task HandleEventAsync(Event stripeEvent, CancellationToken ct);
}

public class PaymentService : IPaymentService
{
    private const decimal PlatformFeeRate = 0.05m;

    private readonly AppDbContext _db;
    private readonly StripeSettings _stripeSettings;
    private readonly AppSettings _appSettings;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(
        AppDbContext db,
        IOptions<StripeSettings> stripeSettings,
        IOptions<AppSettings> appSettings,
        ILogger<PaymentService> logger)
    {
        _db = db;
        _stripeSettings = stripeSettings.Value;
        _appSettings = appSettings.Value;
        _logger = logger;

        if (_stripeSettings.IsConfigured)
        {
            StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
        }
    }

    public bool IsConfigured => _stripeSettings.IsConfigured;

    public async Task<PublishCheckout> CreatePublishCheckoutAsync(
        JobListing job, AppUser lister, CancellationToken ct)
    {
        if (!IsConfigured)
            throw new InvalidOperationException("Stripe er ikke konfigurert.");

        var fee = Math.Round(job.Price * PlatformFeeRate, 2);
        job.PlatformFee = fee;

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            JobListingId = job.Id,
            Amount = fee,
            PlatformFee = fee,
            Currency = _stripeSettings.Currency.ToUpperInvariant(),
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            // StripeSessionId settes etter create — vi må persistere etter Stripe-kall
            StripeSessionId = string.Empty
        };

        var frontendBase = _appSettings.FrontendBaseUrl.TrimEnd('/');

        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            Mode = "payment",
            CustomerEmail = lister.Email,
            ClientReferenceId = payment.Id.ToString(),
            Metadata = new Dictionary<string, string>
            {
                ["paymentId"] = payment.Id.ToString(),
                ["jobId"] = job.Id.ToString()
            },
            LineItems = new List<SessionLineItemOptions>
            {
                new()
                {
                    Quantity = 1,
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = _stripeSettings.Currency,
                        UnitAmount = (long)(fee * 100m), // ører
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = $"Plattformavgift: {job.Title}",
                            Description = $"5% av oppgitt pris {job.Price:0} kr"
                        }
                    }
                }
            },
            SuccessUrl = $"{frontendBase}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            CancelUrl = $"{frontendBase}/jobs/{job.Id}?payment=cancelled"
        };

        var sessionService = new SessionService();
        var session = await sessionService.CreateAsync(options, cancellationToken: ct);

        payment.StripeSessionId = session.Id;
        _db.Payments.Add(payment);

        job.Status = JobStatus.AwaitingPayment;
        await _db.SaveChangesAsync(ct);

        return new PublishCheckout(session.Id, session.Url);
    }

    public async Task<bool> ReconcileSessionAsync(string sessionId, CancellationToken ct)
    {
        if (!IsConfigured)
            return false;

        var payment = await _db.Payments
            .FirstOrDefaultAsync(p => p.StripeSessionId == sessionId, ct);
        if (payment is null)
        {
            _logger.LogWarning("Reconcile: ukjent session {SessionId}", sessionId);
            return false;
        }

        if (payment.Status == PaymentStatus.Succeeded)
            return true;

        var sessionService = new SessionService();
        var session = await sessionService.GetAsync(sessionId, cancellationToken: ct);

        if (session.PaymentStatus == "paid")
        {
            await MarkPaidAsync(payment, session.PaymentIntentId, ct);
            return true;
        }

        return false;
    }

    public async Task HandleEventAsync(Event stripeEvent, CancellationToken ct)
    {
        if (stripeEvent.Type != "checkout.session.completed"
            && stripeEvent.Type != "checkout.session.async_payment_succeeded")
        {
            _logger.LogDebug("Ignorerer Stripe event {Type}", stripeEvent.Type);
            return;
        }

        if (stripeEvent.Data.Object is not Session session)
        {
            _logger.LogWarning("Stripe event uten Session-payload");
            return;
        }

        var payment = await _db.Payments
            .FirstOrDefaultAsync(p => p.StripeSessionId == session.Id, ct);
        if (payment is null)
        {
            _logger.LogWarning("Webhook: ukjent session {SessionId}", session.Id);
            return;
        }

        if (payment.Status == PaymentStatus.Succeeded)
            return;

        if (session.PaymentStatus == "paid")
            await MarkPaidAsync(payment, session.PaymentIntentId, ct);
    }

    private async Task MarkPaidAsync(Payment payment, string? paymentIntentId, CancellationToken ct)
    {
        payment.Status = PaymentStatus.Succeeded;
        payment.StripePaymentIntentId = paymentIntentId;
        payment.CompletedAt = DateTime.UtcNow;

        if (payment.JobListingId is { } jobId)
        {
            var job = await _db.JobListings.FirstOrDefaultAsync(j => j.Id == jobId, ct);
            if (job is not null && job.Status == JobStatus.AwaitingPayment)
            {
                job.Status = JobStatus.Open;
                job.PublishedAt = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Payment {PaymentId} markert betalt", payment.Id);
    }
}
