import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    fixture.detectChanges();
  });

  it('should display 404 code', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const code = compiled.querySelector('.app-not-found-code');
    expect(code?.textContent).toContain('404');
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

  it('should display error icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.app-not-found-icon');
    expect(icon?.textContent).toContain('search_off');
  });
});
