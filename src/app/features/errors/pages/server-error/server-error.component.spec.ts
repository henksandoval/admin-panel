import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ServerErrorComponent } from './server-error.component';

describe('ServerErrorComponent', () => {
  let fixture: ComponentFixture<ServerErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerErrorComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerErrorComponent);
    fixture.detectChanges();
  });

  it('should display 500 code', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const code = compiled.querySelector('.app-server-error-code');
    expect(code?.textContent?.trim()).toBe('500');
  });

  it('should display page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.mat-headline-large');
    expect(title).toBeTruthy();
  });

  it('should have a link to dashboard', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a[data-testid="server-error-page-cta"]');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toContain('/dashboard');
  });

  it('should display error icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('mat-icon');
    expect(icon?.textContent?.trim()).toBe('error_outline');
  });
});
