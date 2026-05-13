using Microsoft.AspNetCore.Mvc;
using SmaaJobb.Api.Payments;
using Stripe;
using Microsoft.Extensions.Options;

namespace SmaaJobb.Api.Controllers;

[ApiController]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _payments;
    private readonly StripeSettings _stripeSettings;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        IPaymentService payments,
        IOptions<StripeSettings> stripeSettings,
        ILogger<PaymentsController> logger)
    {
        _payments = payments;
        _stripeSettings = stripeSettings.Value;
        _logger = logger;
    }

    /// <summary>
    /// Front-end kaller dette fra /payment/success-siden så vi ikke
    /// er avhengig av webhook for å oppdatere UI under utvikling.
    /// </summary>
    [HttpPost("api/payments/{sessionId}/check")]
    public async Task<IActionResult> Check(string sessionId, CancellationToken ct)
    {
        var ok = await _payments.ReconcileSessionAsync(sessionId, ct);
        return Ok(new { paid = ok });
    }

    [HttpPost("api/webhooks/stripe")]
    public async Task<IActionResult> Webhook(CancellationToken ct)
    {
        var json = await new StreamReader(Request.Body).ReadToEndAsync(ct);

        Event stripeEvent;
        try
        {
            var signature = Request.Headers["Stripe-Signature"].ToString();
            stripeEvent = EventUtility.ConstructEvent(
                json,
                signature,
                _stripeSettings.WebhookSecret);
        }
        catch (StripeException ex)
        {
            _logger.LogWarning(ex, "Ugyldig Stripe-signatur");
            return BadRequest();
        }

        await _payments.HandleEventAsync(stripeEvent, ct);
        return Ok();
    }
}
