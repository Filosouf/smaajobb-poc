import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JobsService } from '../jobs/jobs.service';

@Component({
  selector: 'app-payment-success',
  imports: [RouterLink],
  templateUrl: './payment-success.html'
})
export class PaymentSuccessPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly jobs = inject(JobsService);

  readonly state = signal<'checking' | 'paid' | 'unpaid' | 'missing'>('checking');
  readonly attempts = signal(0);

  async ngOnInit(): Promise<void> {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if (!sessionId) {
      this.state.set('missing');
      return;
    }

    // Polle opptil 5 ganger med 1.5s mellom — dekker både webhook-flyt
    // og polling-fallback uten webhook
    for (let i = 0; i < 5; i++) {
      this.attempts.set(i + 1);
      try {
        const res = await this.jobs.checkPayment(sessionId);
        if (res.paid) {
          this.state.set('paid');
          return;
        }
      } catch {
        // ignorer transient errors, prøv igjen
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    this.state.set('unpaid');
  }

  goToJobs(): void {
    this.router.navigate(['/jobs/mine']);
  }
}
