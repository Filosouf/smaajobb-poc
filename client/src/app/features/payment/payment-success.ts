import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/ui-button';
import { UiCard } from '../../shared/ui/ui-card';
import { UiIcon } from '../../shared/ui/ui-icon';
import { JobsService } from '../jobs/jobs.service';

@Component({
  selector: 'app-payment-success',
  imports: [RouterLink, UiButton, UiCard, UiIcon],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.scss'
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

    for (let i = 0; i < 5; i++) {
      this.attempts.set(i + 1);
      try {
        const res = await this.jobs.checkPayment(sessionId);
        if (res.paid) {
          this.state.set('paid');
          return;
        }
      } catch {
        // ignorer
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    this.state.set('unpaid');
  }

  goToJobs(): void {
    this.router.navigate(['/jobs/mine']);
  }
}
