import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '@auth/services/auth.service';
import { AppButtonComponent } from '@ui-atoms/app-button/app-button.component';
import { AppCheckboxComponent } from '@ui-atoms/app-checkbox/app-checkbox.component';
import { AppFormInputComponent } from '@ui-molecules/app-form/app-form-input/app-form-input.component';
import { AppFormInputOptions } from '@ui-molecules/app-form/app-form-input/app-form-input.model';
import { LOGIN_DEFAULTS, LoginStatus } from './login.model';
import { MatDivider } from '@angular/material/divider';
import { AuthPageLayoutComponent } from '@features/auth/shared/templates';
import { LoggingService } from '@core/services/logging.service';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    AppButtonComponent,
    AppCheckboxComponent,
    AppFormInputComponent,
    MatDivider,
    AuthPageLayoutComponent,
  ],
  styleUrl: './login.component.scss',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly logging = inject(LoggingService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    iconRegistry.addSvgIcon('google', sanitizer.bypassSecurityTrustResourceUrl('icons/google.svg'));
  }

  protected readonly status = signal<LoginStatus>(LOGIN_DEFAULTS.status);
  protected readonly errorMessage = signal<string>(LOGIN_DEFAULTS.errorMessage);
  protected readonly showPassword = signal(false);
  protected readonly rememberMe = signal(LOGIN_DEFAULTS.rememberMe);
  protected readonly minPasswordLength = LOGIN_DEFAULTS.passwordMinLength;

  protected readonly emailFieldConfig: AppFormInputOptions = {
    label: $localize`:Login|Email field label@@login.field.email.label:Email`,
    type: 'email',
    placeholder: $localize`:Login|Email field placeholder@@login.field.email.placeholder:user@example.com`,
    icon: 'mail_outline',
    appearance: 'outline',
    errorMessages: {
      required: $localize`:Login|Email required error@@login.field.email.error.required:Email is required`,
      email: $localize`:Login|Email invalid error@@login.field.email.error.email:Enter a valid email`,
    },
  };

  protected readonly passwordFieldConfig = computed<AppFormInputOptions>(() => ({
    label: $localize`:Login|Password field label@@login.field.password.label:Password`,
    type: this.showPassword() ? 'text' : 'password',
    icon: this.showPassword() ? 'visibility_off' : 'visibility',
    appearance: 'outline',
    onIconClick: () => this.showPassword.update(v => !v),
    errorMessages: {
      required: $localize`:Login|Password required error@@login.field.password.error.required:Password is required`,
      minlength: $localize`:Login|Password minlength error@@login.field.password.error.minlength:Minimum ${this.minPasswordLength}:minLength: characters`,
    },
  }));

  protected readonly isLoading = computed(() => this.status() === 'loading');

  protected readonly form = this.fb.group({
    email: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(LOGIN_DEFAULTS.passwordMinLength),
    ]),
  });


  protected onSubmit(): void {
    if (this.form.invalid || this.isLoading()) return;

    this.status.set('loading');
    this.errorMessage.set('');

    const { email, password } = this.form.getRawValue();
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? undefined;

    this.authService.login({ email, password }, returnUrl).subscribe({
      error: (err: unknown) => {
        this.status.set('error');
        this.errorMessage.set(this.resolveErrorMessage(err));
        this.logging.error('Login error', err);
      },
    });
  }

  protected onGoogleLogin(): void {
    // TODO: integrate Google OAuth provider
    this.logging.warn('Google login not yet implemented.');
  }

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return 'Credenciales incorrectas. Inténtalo de nuevo.';
  }
}

