import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UnauthorizedComponent } from './unauthorized.component';

describe('UnauthorizedComponent', () => {
  let fixture: ComponentFixture<UnauthorizedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthorizedComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UnauthorizedComponent);
    fixture.detectChanges();
  });

  it('should display 403 code', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const code = compiled.querySelector('.app-unauthorized-code');
    expect(code?.textContent).toContain('403');
  });

  it('should display page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.mat-headline-large');
    expect(title).toBeTruthy();
  });

  it('should have a link to dashboard', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a[routerLink="/dashboard"]');
    expect(link).toBeTruthy();
  });

  it('should display lock icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.app-unauthorized-icon');
    expect(icon?.textContent).toContain('lock');
  });
});
