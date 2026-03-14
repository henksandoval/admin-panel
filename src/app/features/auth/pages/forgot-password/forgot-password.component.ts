import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '@auth/services/auth.service';
import { AppButtonComponent } from '@ui-atoms/app-button';
import { AppFormInputComponent } from '@ui-molecules/app-form/app-form-input';
import { AppFormInputOptions } from '@ui-molecules/app-form/app-form-input';
import { FORGOT_PASSWORD_DEFAULTS, ForgotPasswordStatus } from './forgot-password.model';
import { AuthPageLayoutComponent } from '@features/auth/shared/templates';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatIcon,
    AppButtonComponent,
    AppFormInputComponent,
    AuthPageLayoutComponent,
  ],
  styleUrl: './forgot-password.component.scss',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly status = signal<ForgotPasswordStatus>(FORGOT_PASSWORD_DEFAULTS.status);
  protected readonly errorMessage = signal<string>(FORGOT_PASSWORD_DEFAULTS.errorMessage);

  protected readonly emailFieldConfig: AppFormInputOptions = {
    label: $localize`:ForgotPassword|Email field label@@forgot.field.email.label:Email`,
    type: 'email',
    placeholder: $localize`:ForgotPassword|Email field placeholder@@forgot.field.email.placeholder:user@example.com`,
    icon: 'mail_outline',
    errorMessages: {
      required: $localize`:ForgotPassword|Email required error@@forgot.field.email.error.required:Email is required`,
      email: $localize`:ForgotPassword|Email invalid error@@forgot.field.email.error.email:Enter a valid email`,
    },
  };

  protected readonly isLoading = computed(() => this.status() === 'loading');
  protected readonly isSuccess = computed(() => this.status() === 'success');

  protected readonly form = this.fb.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
  });

  protected onSubmit(): void {
    if (this.form.invalid || this.isLoading()) return;

    this.status.set('loading');
    this.errorMessage.set('');

    const { email } = this.form.getRawValue();

    this.authService.requestPasswordReset({ email }).subscribe({
      next: () => this.status.set('success'),
      error: (err: unknown) => {
        this.status.set('error');
        this.errorMessage.set(this.resolveErrorMessage(err));
      },
    });
  }

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return $localize`:ForgotPassword|Generic error@@forgot.error.generic:Something went wrong. Please try again.`;
  }
}

