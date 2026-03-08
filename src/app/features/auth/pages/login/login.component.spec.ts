import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, convertToParamMap } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Subject, throwError } from 'rxjs';
import { type Mock, describe, expect, it, vi } from 'vitest';
import { LoginComponent } from './login.component';
import { AuthService } from '@auth/services/auth.service';
import { LoggingService } from '@core/services/logging.service';
import { MatDividerStubComponent } from '@stubs/material/mat-divider.stub';
import { MatIconStubComponent } from '@stubs/material/mat-icon.stub';
import { AppButtonStubComponent } from '@stubs/ui-kit/app-button.stub';
import { AppFormInputStubComponent } from '@stubs/ui-kit/app-form-input.stub';
import { AppCheckboxStubComponent } from '@stubs/ui-kit/app-checkbox.stub';
import { AuthPageLayoutStubComponent } from '@stubs/auth/auth-page-layout.stub';

const VALID_EMAIL = 'user@example.com';
const VALID_PASSWORD = 'password123';

function buildHarness(returnUrl?: string): {
  fixture: ComponentFixture<LoginComponent>;
  authServiceMock: { login: Mock<AuthService['login']> };
} {
  const authServiceMock = { login: vi.fn<AuthService['login']>() };

  TestBed.configureTestingModule({
    imports: [LoginComponent],
    providers: [
      { provide: AuthService, useValue: authServiceMock },
      { provide: LoggingService, useValue: { error: vi.fn(), warn: vi.fn() } },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParamMap: convertToParamMap(returnUrl ? { returnUrl } : {}),
          },
        },
      },
      { provide: MatIconRegistry, useValue: { addSvgIcon: vi.fn() } },
      {
        provide: DomSanitizer,
        useValue: { bypassSecurityTrustResourceUrl: vi.fn().mockReturnValue('') },
      },
    ],
  }).overrideComponent(LoginComponent, {
    set: {
      imports: [
        ReactiveFormsModule,
        RouterLink,
        MatIconStubComponent,
        MatDividerStubComponent,
        AppButtonStubComponent,
        AppCheckboxStubComponent,
        AppFormInputStubComponent,
        AuthPageLayoutStubComponent,
      ],
    },
  });

  const fixture = TestBed.createComponent(LoginComponent);
  fixture.detectChanges();

  return { fixture, authServiceMock };
}

describe('LoginComponent', () => {
  const fillLoginForm = (nativeEl: HTMLElement): void => {
    const emailInput = nativeEl.querySelector<HTMLInputElement>('input[data-testid="login-email-input"]');
    const passwordInput = nativeEl.querySelector<HTMLInputElement>('input[data-testid="login-password-input"]');

    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();

    emailInput!.value = VALID_EMAIL;
    emailInput!.dispatchEvent(new Event('input'));
    passwordInput!.value = VALID_PASSWORD;
    passwordInput!.dispatchEvent(new Event('input'));
  };

  it('does not invoke authService.login when submitted with an empty form', () => {
    const { fixture, authServiceMock } = buildHarness();
    const nativeEl = fixture.nativeElement as HTMLElement;
    const form = nativeEl.querySelector('form');

    expect(form).not.toBeNull();
    form!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('renders the API error message when login fails', () => {
    const { fixture, authServiceMock } = buildHarness();
    authServiceMock.login.mockReturnValue(
      throwError(() => new Error('Invalid credentials')),
    );
    const nativeEl = fixture.nativeElement as HTMLElement;

    fillLoginForm(nativeEl);
    fixture.detectChanges();

    const form = nativeEl.querySelector('form');
    expect(form).not.toBeNull();

    form!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errorBlock = nativeEl.querySelector('[data-testid="login-error-message"]');
    expect(errorBlock).not.toBeNull();
    expect(errorBlock!.textContent).toContain('Invalid credentials');
  });

  it('keeps submit action disabled and ignores repeated submissions while loading', () => {
    const { fixture, authServiceMock } = buildHarness();
    authServiceMock.login.mockReturnValue(new Subject<void>().asObservable());
    const nativeEl = fixture.nativeElement as HTMLElement;

    fillLoginForm(nativeEl);
    fixture.detectChanges();

    const form = nativeEl.querySelector('form');
    expect(form).not.toBeNull();

    form!.dispatchEvent(new Event('submit'));
    form!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const submitButton = nativeEl.querySelector<HTMLButtonElement>('button[data-testid="login-submit-button"]');
    expect(submitButton).not.toBeNull();

    expect(submitButton!.disabled).toBe(true);
    expect(authServiceMock.login).toHaveBeenCalledTimes(1);
  });

  it('forwards the returnUrl query param as the second argument to authService.login', () => {
    const { fixture, authServiceMock } = buildHarness('/dashboard');
    authServiceMock.login.mockReturnValue(new Subject<void>().asObservable());
    const nativeEl = fixture.nativeElement as HTMLElement;

    fillLoginForm(nativeEl);
    fixture.detectChanges();

    const form = nativeEl.querySelector('form');
    expect(form).not.toBeNull();

    form!.dispatchEvent(new Event('submit'));

    expect(authServiceMock.login).toHaveBeenCalledWith(
      { email: VALID_EMAIL, password: VALID_PASSWORD },
      '/dashboard',
    );
  });

  it('changes the password input type to text after clicking the password visibility toggle', () => {
    const { fixture } = buildHarness();
    const nativeEl = fixture.nativeElement as HTMLElement;
    const passwordInput = nativeEl.querySelector<HTMLInputElement>('input[data-testid="login-password-input"]');
    const passwordInputHost = nativeEl.querySelector('app-form-input[testid="login-password-input"]');
    const toggleButton = passwordInputHost?.querySelector<HTMLButtonElement>('button');

    expect(passwordInput).not.toBeNull();
    expect(toggleButton).not.toBeNull();

    expect(passwordInput!.type).toBe('password');

    toggleButton!.click();
    fixture.detectChanges();

    expect(passwordInput!.type).toBe('text');
  });
});
