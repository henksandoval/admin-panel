import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, convertToParamMap } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { type Mock, describe, expect, it, vi } from 'vitest';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '@auth/services/auth.service';
import { AuthPageLayoutStubComponent } from '@stubs/auth/auth-page-layout.stub';
import { MatIconStubComponent } from '@stubs/material/mat-icon.stub';
import { AppButtonStubComponent } from '@stubs/ui-kit/app-button.stub';
import { AppFormInputStubComponent } from '@stubs/ui-kit/app-form-input.stub';

const VALID_EMAIL = 'user@example.com';

function buildHarness(): {
  fixture: ComponentFixture<ForgotPasswordComponent>;
  authServiceMock: { requestPasswordReset: Mock<AuthService['requestPasswordReset']> };
} {
  const authServiceMock = { requestPasswordReset: vi.fn<AuthService['requestPasswordReset']>() };

  TestBed.configureTestingModule({
    imports: [ForgotPasswordComponent],
    providers: [
      { provide: AuthService, useValue: authServiceMock },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
      },
    ],
  }).overrideComponent(ForgotPasswordComponent, {
    set: {
      imports: [
        ReactiveFormsModule,
        RouterLink,
        MatIconStubComponent,
        AppButtonStubComponent,
        AppFormInputStubComponent,
        AuthPageLayoutStubComponent,
      ],
    },
  });

  const fixture = TestBed.createComponent(ForgotPasswordComponent);
  fixture.detectChanges();

  return { fixture, authServiceMock };
}

describe('ForgotPasswordComponent', () => {
  const fillEmailInput = (nativeEl: HTMLElement, email: string): void => {
    const emailInput = nativeEl.querySelector<HTMLInputElement>('input[data-testid="forgot-password-email-input"]');

    expect(emailInput).not.toBeNull();

    emailInput!.value = email;
    emailInput!.dispatchEvent(new Event('input'));
  };

  it('does not invoke authService.requestPasswordReset when submitted with an invalid email', () => {
    const { fixture, authServiceMock } = buildHarness();
    const nativeEl = fixture.nativeElement as HTMLElement;

    fillEmailInput(nativeEl, 'notanemail');
    fixture.detectChanges();

    const form = nativeEl.querySelector('form');
    expect(form).not.toBeNull();

    form!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(authServiceMock.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('renders the API error message and keeps the form visible when the request fails', () => {
    const { fixture, authServiceMock } = buildHarness();
    authServiceMock.requestPasswordReset.mockReturnValue(
      throwError(() => new Error('User not found')),
    );
    const nativeEl = fixture.nativeElement as HTMLElement;

    fillEmailInput(nativeEl, VALID_EMAIL);
    fixture.detectChanges();

    const form = nativeEl.querySelector('form');
    expect(form).not.toBeNull();

    form!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errorBlock = nativeEl.querySelector('[data-testid="forgot-password-error-message"]');
    expect(errorBlock).not.toBeNull();
    expect(errorBlock!.textContent).toContain('User not found');

    expect(nativeEl.querySelector('[data-testid="forgot-password-form"]')).not.toBeNull();
  });

  it('disables the submit button while the request is in progress', () => {
    const { fixture, authServiceMock } = buildHarness();
    authServiceMock.requestPasswordReset.mockReturnValue(new Subject<void>().asObservable());
    const nativeEl = fixture.nativeElement as HTMLElement;

    fillEmailInput(nativeEl, VALID_EMAIL);
    fixture.detectChanges();

    const form = nativeEl.querySelector('form');
    expect(form).not.toBeNull();

    form!.dispatchEvent(new Event('submit'));
    form!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const submitButton = nativeEl.querySelector<HTMLButtonElement>('button[data-testid="forgot-password-submit-button"]');
    expect(submitButton).not.toBeNull();

    expect(submitButton!.disabled).toBe(true);
    expect(authServiceMock.requestPasswordReset).toHaveBeenCalledTimes(1);
  });
});
