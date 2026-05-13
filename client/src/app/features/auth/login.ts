import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UiButton } from '../../shared/ui/ui-button';
import { UiField } from '../../shared/ui/ui-form-field';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, UiButton, UiField],
  templateUrl: './login.html',
  styleUrl: './auth.scss'
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.auth.login(this.form.getRawValue());
      this.router.navigate(['/']);
    } catch (err: unknown) {
      this.errorMessage.set(extractError(err) ?? 'Innlogging mislyktes.');
    } finally {
      this.submitting.set(false);
    }
  }
}

function extractError(err: unknown): string | null {
  if (err && typeof err === 'object' && 'error' in err) {
    const body = (err as { error?: { error?: string } }).error;
    if (body && typeof body.error === 'string') return body.error;
  }
  return null;
}
