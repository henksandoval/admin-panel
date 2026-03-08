import { NO_ERRORS_SCHEMA, Signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Subject, throwError } from 'rxjs';
import { type Mock, describe, expect, it, vi } from 'vitest';

import { LoginComponent } from './login.component';
import { AuthService } from '@auth/services/auth.service';
import { LoggingService } from '@core/services/logging.service';
import { LoginStatus } from './login.model';

const VALID_EMAIL = 'user@example.com';
const VALID_PASSWORD = 'password123';

interface LoginTestSurface {
  form: { setValue(v: { email: string; password: string }): void; invalid: boolean };
  status: Signal<LoginStatus>;
  errorMessage: Signal<string>;
  isLoading: Signal<boolean>;
  passwordFieldConfig: Signal<{ type: string; icon: string; onIconClick(): void }>;
  onSubmit(): void;
}

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
    set: { imports: [ReactiveFormsModule], schemas: [NO_ERRORS_SCHEMA] },
  });

  const fixture = TestBed.createComponent(LoginComponent);
  fixture.detectChanges();

  return { fixture, authServiceMock };
}

describe('LoginComponent', () => {
  it('does not invoke authService.login and leaves the form invalid when submitted empty', () => {
    const { fixture, authServiceMock } = buildHarness();
    const component = fixture.componentInstance as LoginTestSurface;

    component.onSubmit();

    expect(authServiceMock.login).not.toHaveBeenCalled();
    expect(component.form.invalid).toBe(true);
  });

  it('sets status to error and renders the API error message in the template', () => {
    const { fixture, authServiceMock } = buildHarness();
    authServiceMock.login.mockReturnValue(
      throwError(() => new Error('Invalid credentials')),
    );

    const component = fixture.componentInstance as LoginTestSurface;
    component.form.setValue({ email: VALID_EMAIL, password: VALID_PASSWORD });
    component.onSubmit();
    fixture.detectChanges();

    expect(component.status()).toBe('error');
    const errorBlock = (fixture.nativeElement as HTMLElement).querySelector('.app-login__error');
    expect(errorBlock).not.toBeNull();
    expect(errorBlock!.textContent).toContain('Invalid credentials');
  });

  it('keeps isLoading true and ignores repeated submissions while the request is in flight', () => {
    const { fixture, authServiceMock } = buildHarness();
    authServiceMock.login.mockReturnValue(new Subject<void>().asObservable());

    const component = fixture.componentInstance as LoginTestSurface;
    component.form.setValue({ email: VALID_EMAIL, password: VALID_PASSWORD });
    component.onSubmit();
    component.onSubmit();

    expect(component.isLoading()).toBe(true);
    expect(authServiceMock.login).toHaveBeenCalledTimes(1);
  });

  it('forwards the returnUrl query param as the second argument to authService.login', () => {
    const { fixture, authServiceMock } = buildHarness('/dashboard');
    authServiceMock.login.mockReturnValue(new Subject<void>().asObservable());

    const component = fixture.componentInstance as LoginTestSurface;
    component.form.setValue({ email: VALID_EMAIL, password: VALID_PASSWORD });
    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith(
      { email: VALID_EMAIL, password: VALID_PASSWORD },
      '/dashboard',
    );
  });

  it('changes the password field type to text and icon to visibility_off after the icon is clicked', () => {
    const { fixture } = buildHarness();
    const component = fixture.componentInstance as LoginTestSurface;

    expect(component.passwordFieldConfig().type).toBe('password');

    component.passwordFieldConfig().onIconClick();
    fixture.detectChanges();

    expect(component.passwordFieldConfig().type).toBe('text');
    expect(component.passwordFieldConfig().icon).toBe('visibility_off');
  });
});
