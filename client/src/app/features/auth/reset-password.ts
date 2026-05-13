import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html'
})
export class ResetPasswordPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly missingParams = signal(false);

  private email = '';
  private token = '';

  readonly form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.email = qp.get('email') ?? '';
    this.token = qp.get('token') ?? '';
    if (!this.email || !this.token) {
      this.missingParams.set(true);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.form.getRawValue();
    if (newPassword !== confirmPassword) {
      this.errorMessage.set('Passordene matcher ikke.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.auth.resetPassword(this.email, this.token, newPassword);
      this.router.navigate(['/login'], {
        queryParams: { reset: '1' }
      });
    } catch (err: unknown) {
      this.errorMessage.set(
        extractError(err) ?? 'Kunne ikke tilbakestille passordet. Be om ny lenke.'
      );
    } finally {
      this.submitting.set(false);
    }
  }
}

function extractError(err: unknown): string | null {
  if (err && typeof err === 'object' && 'error' in err) {
    const body = (err as { error?: { error?: string; errors?: string[] } }).error;
    if (body?.error) return body.error;
    if (body?.errors?.length) return body.errors.join(' ');
  }
  return null;
}
