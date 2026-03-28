import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, convertToParamMap } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '@core/auth/services';
import { AuthPageLayoutStubComponent } from '@stubs/auth/auth-page-layout.stub';
import { MatIconStubComponent } from '@stubs/material/mat-icon.stub';
import { AppButtonStubComponent } from '@stubs/ui-kit/app-button.stub';
import { AppFormInputStubComponent } from '@stubs/ui-kit/app-form-input.stub';

const VALID_EMAIL = 'user@example.com';

async function renderForgotPasswordComponent() {
  const authServiceMock = { requestPasswordReset: vi.fn<AuthService['requestPasswordReset']>() };

  const { fixture } = await render(ForgotPasswordComponent, {
    componentImports: [
      ReactiveFormsModule,
      RouterLink,
      MatIconStubComponent,
      AppButtonStubComponent,
      AppFormInputStubComponent,
      AuthPageLayoutStubComponent,
    ],
    providers: [
      { provide: AuthService, useValue: authServiceMock },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
      },
    ],
  });

  return { authServiceMock, fixture };
}

describe('ForgotPasswordComponent', () => {
  it('does not invoke authService.requestPasswordReset when submitted with an invalid email', async () => {
    const { authServiceMock, fixture } = await renderForgotPasswordComponent();
    const user = userEvent.setup();

    await user.type(screen.getByTestId('forgot-password-email-input'), 'notanemail');

    const form = screen.getByRole('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(authServiceMock.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('renders the API error message and keeps the form visible when the request fails', async () => {
    const { authServiceMock, fixture } = await renderForgotPasswordComponent();
    authServiceMock.requestPasswordReset.mockReturnValue(throwError(() => new Error('User not found')));
    const user = userEvent.setup();

    await user.type(screen.getByTestId('forgot-password-email-input'), VALID_EMAIL);

    const form = screen.getByRole('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errorBlock = screen.getByTestId('forgot-password-error-message');
    expect(errorBlock.textContent).toContain('User not found');

    expect(screen.getByTestId('forgot-password-form')).toBeTruthy();
  });

  it('disables the submit button and ignores repeated submissions while loading', async () => {
    const { authServiceMock, fixture } = await renderForgotPasswordComponent();
    authServiceMock.requestPasswordReset.mockReturnValue(new Subject<void>().asObservable());
    const user = userEvent.setup();

    await user.type(screen.getByTestId('forgot-password-email-input'), VALID_EMAIL);

    const form = screen.getByRole('form');
    form.dispatchEvent(new Event('submit'));
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const submitButton = screen.getByTestId<HTMLButtonElement>('forgot-password-submit-button');
    expect(submitButton.disabled).toBe(true);
    expect(authServiceMock.requestPasswordReset).toHaveBeenCalledTimes(1);
  });
});
