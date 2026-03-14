import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '@auth/services/auth.service';
import { AppButtonComponent } from '@ui-atoms/app-button';
import { AppFormInputComponent } from '@ui-molecules/app-form/app-form-input';
import { AppFormInputOptions } from '@ui-molecules/app-form/app-form-input';
import { passwordMatchValidator } from '@features/auth/shared/validators';
import { REGISTER_DEFAULTS, RegisterStatus } from './register.model';
import { AuthPageLayoutComponent } from '@features/auth/shared/templates';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatIcon,
    AppButtonComponent,
    AppFormInputComponent,
    AuthPageLayoutComponent,
  ],
  styleUrl: './register.component.scss',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly status = signal<RegisterStatus>(REGISTER_DEFAULTS.status);
  protected readonly errorMessage = signal<string>(REGISTER_DEFAULTS.errorMessage);
  protected readonly showPassword = signal(false);
  protected readonly minPasswordLength = REGISTER_DEFAULTS.passwordMinLength;

  protected readonly nameFieldConfig: AppFormInputOptions = {
    label: $localize`:Register|Name field label@@register.field.name.label:Full name`,
    type: 'text',
    placeholder: $localize`:Register|Name field placeholder@@register.field.name.placeholder:John Doe`,
    icon: 'person_outline',
    errorMessages: {
      required: $localize`:Register|Name required error@@register.field.name.error.required:Full name is required`,
    },
  };

  protected readonly emailFieldConfig: AppFormInputOptions = {
    label: $localize`:Register|Email field label@@register.field.email.label:Email`,
    type: 'email',
    placeholder: $localize`:Register|Email field placeholder@@register.field.email.placeholder:user@example.com`,
    icon: 'mail_outline',
    errorMessages: {
      required: $localize`:Register|Email required error@@register.field.email.error.required:Email is required`,
      email: $localize`:Register|Email invalid error@@register.field.email.error.email:Enter a valid email`,
    },
  };

  protected readonly passwordFieldConfig = computed<AppFormInputOptions>(() => ({
    label: $localize`:Register|Password field label@@register.field.password.label:Password`,
    type: this.showPassword() ? 'text' : 'password',
    icon: this.showPassword() ? 'visibility_off' : 'visibility',
    onIconClick: () => this.showPassword.update(v => !v),
    errorMessages: {
      required: $localize`:Register|Password required error@@register.field.password.error.required:Password is required`,
      minlength: $localize`:Register|Password minlength error@@register.field.password.error.minlength:Minimum ${this.minPasswordLength}:minLength: characters`,
    },
  }));

  protected readonly confirmFieldConfig = computed<AppFormInputOptions>(() => ({
    label: $localize`:Register|Confirm password field label@@register.field.confirm.label:Confirm password`,
    type: this.showPassword() ? 'text' : 'password',
    icon: this.showPassword() ? 'visibility_off' : 'visibility',
    onIconClick: () => this.showPassword.update(v => !v),
    errorMessages: {
      required: $localize`:Register|Confirm password required error@@register.field.confirm.error.required:Please confirm your password`,
      passwordMismatch: $localize`:Register|Password mismatch error@@register.field.confirm.error.mismatch:Passwords do not match`,
    },
  }));

  protected readonly isLoading = computed(() => this.status() === 'loading');

  protected readonly form = this.fb.group(
    {
      displayName: this.fb.nonNullable.control('', [Validators.required]),
      email:       this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      password:    this.fb.nonNullable.control('', [Validators.required, Validators.minLength(REGISTER_DEFAULTS.passwordMinLength)]),
      confirm:     this.fb.nonNullable.control('', [Validators.required]),
    },
    { validators: passwordMatchValidator },
  );

  protected onSubmit(): void {
    if (this.form.invalid || this.isLoading()) return;

    this.status.set('loading');
    this.errorMessage.set('');

    const { displayName, email, password } = this.form.getRawValue();

    this.authService.register({ displayName, email, password }).subscribe({
      next: () => {
        this.status.set('success');
        void this.router.navigate(['/auth/login']);
      },
      error: (err: unknown) => {
        this.status.set('error');
        this.errorMessage.set(this.resolveErrorMessage(err));
      },
    });
  }

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return $localize`:Register|Generic error@@register.error.generic:Registration failed. Please try again.`;
  }
}



