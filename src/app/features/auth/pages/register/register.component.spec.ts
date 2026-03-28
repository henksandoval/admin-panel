import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { RegisterComponent } from './register.component';
import { AuthService } from '@core/auth';
import { MatIconStubComponent } from '@stubs/material/mat-icon.stub';
import { AppButtonStubComponent } from '@stubs/ui-kit/app-button.stub';
import { AppCheckboxStubComponent } from '@stubs/ui-kit/app-checkbox.stub';
import { AppFormInputStubComponent } from '@stubs/ui-kit/app-form-input.stub';
import { AuthPageLayoutStubComponent } from '@stubs/auth/auth-page-layout.stub';

const VALID_NAME = 'John Doe';
const VALID_EMAIL = 'user@example.com';
const VALID_PASSWORD = 'Password123';

async function renderRegisterComponent() {
  const authServiceMock = { register: vi.fn<AuthService['register']>() };

  const { fixture } = await render(RegisterComponent, {
    componentImports: [
      ReactiveFormsModule,
      RouterLink,
      MatIconStubComponent,
      AppButtonStubComponent,
      AppCheckboxStubComponent,
      AppFormInputStubComponent,
      AuthPageLayoutStubComponent,
    ],
    imports: [RouterLink],
    providers: [
      { provide: AuthService, useValue: authServiceMock },
    ],
  });

  return { authServiceMock, fixture };
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByTestId('register-name-input'), VALID_NAME);
  await user.type(screen.getByTestId('register-email-input'), VALID_EMAIL);
  await user.type(screen.getByTestId('register-password-input'), VALID_PASSWORD);
  await user.type(screen.getByTestId('register-confirm-input'), VALID_PASSWORD);
}

describe('RegisterComponent', () => {
  it('does not invoke authService.register when passwords do not match', async () => {
    const { authServiceMock } = await renderRegisterComponent();
    const user = userEvent.setup();

    await user.type(screen.getByTestId('register-name-input'), VALID_NAME);
    await user.type(screen.getByTestId('register-email-input'), VALID_EMAIL);
    await user.type(screen.getByTestId('register-password-input'), VALID_PASSWORD);
    await user.type(screen.getByTestId('register-confirm-input'), 'DifferentPassword123');

    const form = screen.getByRole('form');
    form.dispatchEvent(new Event('submit'));

    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('renders the API error message when registration fails', async () => {
    const { authServiceMock, fixture } = await renderRegisterComponent();
    authServiceMock.register.mockReturnValue(throwError(() => new Error('Email already in use')));

    const user = userEvent.setup();
    await fillValidForm(user);

    const form = screen.getByRole('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errorBlock = screen.getByTestId('register-error-message');
    expect(errorBlock.textContent).toContain('Email already in use');
  });

  it('keeps submit action disabled and ignores repeated submissions while loading', async () => {
    const { authServiceMock, fixture } = await renderRegisterComponent();
    authServiceMock.register.mockReturnValue(new Subject<void>().asObservable());

    const user = userEvent.setup();
    await fillValidForm(user);

    const form = screen.getByRole('form');
    form.dispatchEvent(new Event('submit'));
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const submitButton = screen.getByTestId<HTMLButtonElement>('register-submit-button');

    expect(submitButton.disabled).toBe(true);
    expect(authServiceMock.register).toHaveBeenCalledTimes(1);
  });

  it('changes both password inputs to text when show password is toggled', async () => {
    const { fixture } = await renderRegisterComponent();

    const passwordInput = screen.getByTestId<HTMLInputElement>('register-password-input');
    const confirmInput = screen.getByTestId<HTMLInputElement>('register-confirm-input');
    const user = userEvent.setup();

    expect(passwordInput.type).toBe('password');
    expect(confirmInput.type).toBe('password');

    const showPasswordButton = screen.getByTestId('register-password-input-icon');
    await user.click(showPasswordButton);
    fixture.detectChanges();

    expect(passwordInput.type).toBe('text');
    expect(confirmInput.type).toBe('text');
  });
});
