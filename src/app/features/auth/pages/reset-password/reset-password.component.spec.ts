import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, convertToParamMap } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '@auth/services/auth.service';
import { MatIconStubComponent } from '@stubs/material/mat-icon.stub';
import { AppButtonStubComponent } from '@stubs/ui-kit/app-button.stub';
import { AppCheckboxStubComponent } from '@stubs/ui-kit/app-checkbox.stub';
import { AppFormInputStubComponent } from '@stubs/ui-kit/app-form-input.stub';
import { AuthPageLayoutStubComponent } from '@stubs/auth/auth-page-layout.stub';

const VALID_PASSWORD = 'Password123';
const VALID_TOKEN = 'valid-token';

async function renderResetPasswordComponent(token?: string | null) {
  const authServiceMock = { confirmPasswordReset: vi.fn<AuthService['confirmPasswordReset']>() };
  const routerMock = {
    navigate: vi.fn(),
    createUrlTree: vi.fn().mockReturnValue({}),
    serializeUrl: vi.fn().mockReturnValue(''),
    events: new Subject(),
  };

  const { fixture } = await render(ResetPasswordComponent, {
    componentImports: [
      ReactiveFormsModule,
      RouterLink,
      MatIconStubComponent,
      AppButtonStubComponent,
      AppCheckboxStubComponent,
      AppFormInputStubComponent,
      AuthPageLayoutStubComponent,
    ],
    providers: [
      { provide: AuthService, useValue: authServiceMock },
      { provide: Router, useValue: routerMock },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParamMap: convertToParamMap(token != null ? { token } : {}),
          },
        },
      },
    ],
  });

  return { authServiceMock, routerMock, fixture };
}

describe('ResetPasswordComponent', () => {
  it('shows invalid token state and hides form when no token is present in the URL', async () => {
    await renderResetPasswordComponent(null);

    expect(screen.getByTestId('reset-password-invalid-token-message')).toBeTruthy();
    expect(screen.queryByRole('form')).toBeNull();
    expect(screen.getByTestId('reset-password-request-new-link-button')).toBeTruthy();
  });

  it('does not invoke authService.confirmPasswordReset when passwords do not match', async () => {
    const { authServiceMock, fixture } = await renderResetPasswordComponent(VALID_TOKEN);

    const passwordInput = screen.getByTestId('reset-password-password-input');
    const confirmInput = screen.getByTestId('reset-password-confirm-input');
    const user = userEvent.setup();

    await user.type(passwordInput, VALID_PASSWORD);
    await user.type(confirmInput, 'DifferentPass456');

    const form = screen.getByRole('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(authServiceMock.confirmPasswordReset).not.toHaveBeenCalled();
  });

  it('shows API error message when confirmPasswordReset fails', async () => {
    const { authServiceMock, fixture } = await renderResetPasswordComponent(VALID_TOKEN);
    authServiceMock.confirmPasswordReset.mockReturnValue(throwError(() => new Error('Token expired')));

    const passwordInput = screen.getByTestId('reset-password-password-input');
    const confirmInput = screen.getByTestId('reset-password-confirm-input');
    const user = userEvent.setup();

    await user.type(passwordInput, VALID_PASSWORD);
    await user.type(confirmInput, VALID_PASSWORD);

    const form = screen.getByRole('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errorBlock = screen.getByTestId('reset-password-error-message');
    expect(errorBlock.textContent).toContain('Token expired');
  });

  it('disables the submit button and ignores repeated submissions while loading', async () => {
    const { authServiceMock, fixture } = await renderResetPasswordComponent(VALID_TOKEN);
    authServiceMock.confirmPasswordReset.mockReturnValue(new Subject<void>().asObservable());

    const passwordInput = screen.getByTestId('reset-password-password-input');
    const confirmInput = screen.getByTestId('reset-password-confirm-input');
    const user = userEvent.setup();

    await user.type(passwordInput, VALID_PASSWORD);
    await user.type(confirmInput, VALID_PASSWORD);

    const form = screen.getByRole('form');
    form.dispatchEvent(new Event('submit'));
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const submitButton = screen.getByTestId<HTMLButtonElement>('reset-password-submit-button');

    expect(submitButton.disabled).toBe(true);
    expect(authServiceMock.confirmPasswordReset).toHaveBeenCalledTimes(1);
  });

  it('navigates to forgot-password when the request new link button is clicked', async () => {
    const { routerMock } = await renderResetPasswordComponent(null);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('reset-password-request-new-link-button'));

    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/forgot-password']);
  });
});
