import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, convertToParamMap } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Subject, throwError, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { LoginComponent } from './login.component';
import { AuthService } from '@core/auth/services';
import { LoggingService, LOG_LEVEL, LogLevel } from '@core/logging-audit';
import { MatDividerStubComponent } from '@stubs/material/mat-divider.stub';
import { MatIconStubComponent } from '@stubs/material/mat-icon.stub';
import { AppButtonStubComponent } from '@stubs/ui-kit/app-button.stub';
import { AppFormInputStubComponent } from '@stubs/ui-kit/app-form-input.stub';
import { AppCheckboxStubComponent } from '@stubs/ui-kit/app-checkbox.stub';
import { AuthPageLayoutStubComponent } from '@stubs/auth/auth-page-layout.stub';

const VALID_EMAIL = 'user@example.com';
const VALID_PASSWORD = 'password123';

async function renderLoginComponent(returnUrl?: string) {
  const authServiceMock = { login: vi.fn<AuthService['login']>() };

  TestBed.configureTestingModule({
    imports: [LoginComponent],
    providers: [
      { provide: AuthService, useValue: authServiceMock },
      { provide: LoggingService, useValue: { error: vi.fn(), warn: vi.fn() } },
      { provide: LOG_LEVEL, useValue: LogLevel.warn },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParamMap: convertToParamMap(returnUrl ? { returnUrl } : {}),
          },
        },
      },
      {
        provide: MatIconRegistry,
        useValue: {
          addSvgIcon: vi.fn(),
          getNamedSvgIcon: vi.fn().mockReturnValue(of(null)),
        },
      },
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
  it('does not invoke authService.login when submitted with an empty form', async () => {
    const { fixture, authServiceMock } = await renderLoginComponent();
    const form = fixture.nativeElement.querySelector('form');

    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('renders the API error message when login fails', async () => {
    const { fixture, authServiceMock } = await renderLoginComponent();
    authServiceMock.login.mockReturnValue(throwError(() => new Error('Invalid credentials')));

    const emailInput = screen.getByTestId('login-email-input') as HTMLInputElement;
    const passwordInput = screen.getByTestId('login-password-input') as HTMLInputElement;
    const user = userEvent.setup();

    await user.type(emailInput, VALID_EMAIL);
    await user.type(passwordInput, VALID_PASSWORD);

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errorBlock = screen.getByTestId('login-error-message');
    expect(errorBlock.textContent).toContain('Invalid credentials');
  });

  it('keeps submit action disabled and ignores repeated submissions while loading', async () => {
    const { fixture, authServiceMock } = await renderLoginComponent();
    authServiceMock.login.mockReturnValue(new Subject<void>().asObservable());

    const emailInput = screen.getByTestId('login-email-input') as HTMLInputElement;
    const passwordInput = screen.getByTestId('login-password-input') as HTMLInputElement;
    const user = userEvent.setup();

    await user.type(emailInput, VALID_EMAIL);
    await user.type(passwordInput, VALID_PASSWORD);

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const submitButton = screen.getByTestId('login-submit-button') as HTMLButtonElement;

    expect(submitButton.disabled).toBe(true);
    expect(authServiceMock.login).toHaveBeenCalledTimes(1);
  });

  it('forwards the returnUrl query param as the second argument to authService.login', async () => {
    const { fixture, authServiceMock } = await renderLoginComponent('/dashboard');
    authServiceMock.login.mockReturnValue(new Subject<void>().asObservable());

    const emailInput = screen.getByTestId('login-email-input') as HTMLInputElement;
    const passwordInput = screen.getByTestId('login-password-input') as HTMLInputElement;
    const user = userEvent.setup();

    await user.type(emailInput, VALID_EMAIL);
    await user.type(passwordInput, VALID_PASSWORD);

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));

    expect(authServiceMock.login).toHaveBeenCalledWith(
      { email: VALID_EMAIL, password: VALID_PASSWORD },
      '/dashboard',
    );
  });

  it('changes the password input type to text after clicking the password visibility toggle', async () => {
    const { fixture } = await renderLoginComponent();

    const passwordInput = screen.getByTestId('login-password-input') as HTMLInputElement;
    const passwordInputHost = screen
      .getByTestId('login-password-input')
      .closest('app-form-input');
    const toggleButton = passwordInputHost?.querySelector<HTMLButtonElement>('button');
    const user = userEvent.setup();

    expect(passwordInput.type).toBe('password');

    if (toggleButton) {
      await user.click(toggleButton);
      fixture.detectChanges();
    }

    expect(passwordInput.type).toBe('text');
  });
});
