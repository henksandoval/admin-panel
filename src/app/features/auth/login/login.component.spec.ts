import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { LoginComponent } from './login.component';
import { LOGIN_DEFAULTS } from './login.model';
import { AuthService } from '@auth/services/auth.service';
import { of, throwError } from 'rxjs';

const authServiceMock: Pick<AuthService, 'login'> = {
  login: vi.fn(() => of(undefined)),
};

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates with default status idle', () => {
    expect(component['status']()).toBe(LOGIN_DEFAULTS.status);
  });

  it('creates with default errorMessage empty', () => {
    expect(component['errorMessage']()).toBe(LOGIN_DEFAULTS.errorMessage);
  });

  it('initializes showPassword as false', () => {
    expect(component['showPassword']()).toBe(false);
  });

  it('exposes minPasswordLength from DEFAULTS', () => {
    expect(component['minPasswordLength']).toBe(LOGIN_DEFAULTS.passwordMinLength);
  });

  it('isLoading returns false when status is idle', () => {
    expect(component['isLoading']()).toBe(false);
  });

  describe('togglePassword', () => {
    it('toggles showPassword from false to true', () => {
      component['togglePassword']();
      expect(component['showPassword']()).toBe(true);
    });

    it('toggles showPassword back to false on second call', () => {
      component['togglePassword']();
      component['togglePassword']();
      expect(component['showPassword']()).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('does not call authService when form is invalid', () => {
      const spy = vi.spyOn(authServiceMock, 'login').mockReturnValue(of(undefined));
      component['onSubmit']();
      expect(spy).not.toHaveBeenCalled();
    });

    it('calls authService when form is valid', () => {
      component['formGroupLogin'].setValue({ email: 'user@example.com', password: 'password123' });
      const spy = vi.spyOn(authServiceMock, 'login').mockReturnValue(of(undefined));
      component['onSubmit']();
      expect(spy).toHaveBeenCalled();
    });

    it('sets status to error and errorMessage on login failure', () => {
      component['formGroupLogin'].setValue({ email: 'user@example.com', password: 'password123' });
      vi.spyOn(authServiceMock, 'login').mockReturnValue(throwError(() => new Error('Credenciales inválidas')));

      component['onSubmit']();

      expect(component['status']()).toBe('error');
      expect(component['errorMessage']()).toBe('Credenciales inválidas');
    });

    it('uses fallback error message for non-Error objects', () => {
      component['formGroupLogin'].setValue({ email: 'user@example.com', password: 'password123' });
      vi.spyOn(authServiceMock, 'login').mockReturnValue(throwError(() => 'unknown'));

      component['onSubmit']();

      expect(component['errorMessage']()).toBe('Credenciales incorrectas. Inténtalo de nuevo.');
    });
  });
});



