import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '@auth/services/auth.service';
import { AppButtonComponent } from '@ui-atoms/app-button';
import { AppCheckboxComponent } from '@ui-atoms/app-checkbox';
import { AppFormInputComponent } from '@ui-molecules/app-form/app-form-input';
import { AppFormInputOptions } from '@ui-molecules/app-form/app-form-input';
import { passwordMatchValidator } from '@features/auth/shared/validators';
import { RESET_PASSWORD_DEFAULTS, ResetPasswordStatus } from './reset-password.model';
import { AuthPageLayoutComponent } from '@features/auth/shared/templates';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatIcon,
    AppButtonComponent,
    AppCheckboxComponent,
    AppFormInputComponent,
    AuthPageLayoutComponent,
  ],
  styleUrl: './reset-password.component.scss',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly status = signal<ResetPasswordStatus>(RESET_PASSWORD_DEFAULTS.status);
  protected readonly errorMessage = signal<string>(RESET_PASSWORD_DEFAULTS.errorMessage);
  protected readonly showPassword = signal(false);
  protected readonly minPasswordLength = RESET_PASSWORD_DEFAULTS.passwordMinLength;

  private token = '';

  protected readonly passwordFieldConfig = computed<AppFormInputOptions>(() => ({
    label: $localize`:ResetPassword|Password field label@@reset.field.password.label:New password`,
    type: this.showPassword() ? 'text' : 'password',
    icon: 'key',
    appearance: 'outline',
    errorMessages: {
      required: $localize`:ResetPassword|Password required error@@reset.field.password.error.required:Password is required`,
      minlength: $localize`:ResetPassword|Password minlength error@@reset.field.password.error.minlength:Minimum ${this.minPasswordLength}:minLength: characters`,
    },
  }));

  protected readonly confirmFieldConfig = computed<AppFormInputOptions>(() => ({
    label: $localize`:ResetPassword|Confirm password field label@@reset.field.confirm.label:Confirm new password`,
    type: this.showPassword() ? 'text' : 'password',
    icon: 'key',
    appearance: 'outline',
    errorMessages: {
      required: $localize`:ResetPassword|Confirm required error@@reset.field.confirm.error.required:Please confirm your password`,
      passwordMismatch: $localize`:ResetPassword|Password mismatch error@@reset.field.confirm.error.mismatch:Passwords do not match`,
    },
  }));

  protected readonly isLoading = computed(() => this.status() === 'loading');
  protected readonly isSuccess = computed(() => this.status() === 'success');
  protected readonly isInvalidToken = computed(() => this.status() === 'invalid-token');

  protected readonly form = this.fb.group(
    {
      password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(RESET_PASSWORD_DEFAULTS.passwordMinLength)]),
      confirm:  this.fb.nonNullable.control('', [Validators.required]),
    },
    { validators: passwordMatchValidator },
  );

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status.set('invalid-token');
      return;
    }
    this.token = token;
  }

  protected onShowPasswordChange(checked: boolean): void {
    this.showPassword.set(checked);
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.isLoading() || !this.token) return;

    this.status.set('loading');
    this.errorMessage.set('');

    const { password } = this.form.getRawValue();

    this.authService.confirmPasswordReset({ token: this.token, password }).subscribe({
      next: () => this.status.set('success'),
      error: (err: unknown) => {
        this.status.set('error');
        this.errorMessage.set(this.resolveErrorMessage(err));
      },
    });
  }

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return $localize`:ResetPassword|Generic error@@reset.error.generic:Something went wrong. Please try again.`;
  }

  protected goToLogin(): void {
    void this.router.navigate(['/auth/login']);
  }

  protected goToForgotPassword(): void {
    void this.router.navigate(['/auth/forgot-password']);
  }
}



