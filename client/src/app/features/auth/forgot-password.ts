import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UiButton } from '../../shared/ui/ui-button';
import { UiField } from '../../shared/ui/ui-form-field';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, UiButton, UiField],
  templateUrl: './forgot-password.html',
  styleUrl: './auth.scss'
})
export class ForgotPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly submitting = signal(false);
  readonly sent = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    try {
      await this.auth.forgotPassword(this.form.getRawValue().email);
      this.sent.set(true);
    } catch {
      this.sent.set(true);
    } finally {
      this.submitting.set(false);
    }
  }
}
