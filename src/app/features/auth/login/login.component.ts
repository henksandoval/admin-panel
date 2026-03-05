import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@auth/services/auth.service';
import { LOGIN_DEFAULTS, LoginStatus } from './login.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  styleUrl: './login.component.scss',
  template: `
    <div class="app-login__card">
      <div class="flex flex-col items-center gap-2 mb-8">
        <mat-icon class="app-login__logo" color="primary">lock</mat-icon>
        <h1 class="mat-headline-medium m-0">Bienvenido</h1>
        <p class="mat-body-medium m-0">Inicia sesión para continuar</p>
      </div>

      @if (status() === 'error') {
        <div class="app-login__error flex items-center gap-2 mb-4">
          <mat-icon>error_outline</mat-icon>
          <span class="mat-body-medium">{{ errorMessage() }}</span>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Correo electrónico</mat-label>
          <input
            matInput
            type="email"
            formControlName="email"
            placeholder="usuario@ejemplo.com"
            autocomplete="email"
          />
          <mat-icon matSuffix>mail_outline</mat-icon>
          @if (form.controls.email.hasError('required')) {
            <mat-error>El correo es obligatorio</mat-error>
          } @else if (form.controls.email.hasError('email')) {
            <mat-error>Introduce un correo válido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Contraseña</mat-label>
          <input
            matInput
            [type]="showPassword() ? 'text' : 'password'"
            formControlName="password"
            autocomplete="current-password"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            (click)="togglePassword()"
          >
            <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.controls.password.hasError('required')) {
            <mat-error>La contraseña es obligatoria</mat-error>
          } @else if (form.controls.password.hasError('minlength')) {
            <mat-error>
              Mínimo {{ LOGIN_DEFAULTS.passwordMinLength }} caracteres
            </mat-error>
          }
        </mat-form-field>

        <button
          mat-flat-button
          color="primary"
          type="submit"
          class="w-full"
          [disabled]="isLoading()"
        >
          @if (isLoading()) {
            <mat-progress-spinner diameter="20" mode="indeterminate" />
          } @else {
            Iniciar sesión
          }
        </button>
      </form>
    </div>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly status = signal<LoginStatus>(LOGIN_DEFAULTS.status);
  protected readonly errorMessage = signal<string>(LOGIN_DEFAULTS.errorMessage);
  protected readonly showPassword = signal(false);
  protected readonly LOGIN_DEFAULTS = LOGIN_DEFAULTS;

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

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.isLoading()) return;

    this.status.set('loading');
    this.errorMessage.set('');

    const { email, password } = this.form.getRawValue();
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? undefined;

    this.authService.login({ email, password }, returnUrl).subscribe({
      error: (err) => {
        this.status.set('error');
        this.errorMessage.set(this.resolveErrorMessage(err));
      },
    });
  }

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return 'Credenciales incorrectas. Inténtalo de nuevo.';
  }
}

