import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
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
  private readonly auth = inject(AuthService);

  readonly state = signal<'checking' | 'paid' | 'unpaid' | 'missing' | 'error'>('checking');
  readonly attempts = signal(0);
  readonly errorDetail = signal<string | null>(null);
  readonly isAuthed = computed(() => this.auth.isAuthenticated());

  async ngOnInit(): Promise<void> {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if (!sessionId) {
      this.state.set('missing');
      return;
    }

    // Forsøk silent refresh før vi sjekker betaling — sesjonen kan ha
    // overlevd Stripe-redirecten via cookie selv om access-token er borte.
    if (!this.auth.isAuthenticated()) {
      await this.auth.tryRefresh();
    }

    for (let i = 0; i < 5; i++) {
      this.attempts.set(i + 1);
      try {
        const res = await this.jobs.checkPayment(sessionId);
        if (res.paid) {
          this.state.set('paid');
          return;
        }
      } catch (err: unknown) {
        this.errorDetail.set(extractError(err));
        if (i >= 2) {
          this.state.set('error');
          return;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    this.state.set('unpaid');
  }

  goToJobs(): void {
    this.router.navigate(['/jobs/mine']);
  }
}

function extractError(err: unknown): string | null {
  if (err && typeof err === 'object' && 'error' in err) {
    const body = (err as { error?: { error?: string } }).error;
    if (body?.error) return body.error;
    const status = (err as { status?: number }).status;
    if (status) return `HTTP ${status}`;
  }
  return null;
}
