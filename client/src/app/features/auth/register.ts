import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UiButton } from '../../shared/ui/ui-button';
import { UiField } from '../../shared/ui/ui-form-field';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, UiButton, UiField],
  templateUrl: './register.html',
  styleUrl: './auth.scss'
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    birthDate: ['', [Validators.required]],
    phoneNumber: [''],
    postalCode: ['']
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      const v = this.form.getRawValue();
      await this.auth.register({
        fullName: v.fullName,
        email: v.email,
        password: v.password,
        birthDate: v.birthDate,
        phoneNumber: v.phoneNumber || undefined,
        postalCode: v.postalCode || undefined
      });
      this.router.navigate(['/']);
    } catch (err: unknown) {
      this.errorMessage.set(extractError(err) ?? 'Registrering mislyktes.');
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
