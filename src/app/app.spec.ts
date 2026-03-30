import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { App } from './app';
import { AUTH_PROVIDER } from '@core/auth/providers';
import { AuditService } from '@core/logging-audit';
import { createMockAuthProvider } from '@test-helpers/auth';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, RouterTestingModule],
      providers: [
        { provide: AUTH_PROVIDER, useValue: createMockAuthProvider() },
        { provide: AuditService, useValue: { record: () => of(void 0) } },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
