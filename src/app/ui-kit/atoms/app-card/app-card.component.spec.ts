import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppCardComponent } from './app-card.component';

describe('AppCardComponent', () => {
  let fixture: ComponentFixture<AppCardComponent>;
  let component: AppCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates with all default values', () => {
    expect(component.variant()).toBe('outlined');
    expect(component.customClass()).toBe('');
    expect(component.isExpandable()).toBe(false);
    expect(component.expanded()).toBe(true);
  });

  describe('panelClass', () => {
    it('returns mat-mdc-card-outlined for outlined and empty for raised', () => {
      expect(component.panelClass()).toBe('mat-mdc-card-outlined');

      fixture.componentRef.setInput('variant', 'raised');
      expect(component.panelClass()).toBe('');
    });

    it('combines variant class and customClass', () => {
      fixture.componentRef.setInput('customClass', 'my-custom-card');
      const cls = component.panelClass();
      expect(cls).toContain('mat-mdc-card-outlined');
      expect(cls).toContain('my-custom-card');
    });
  });

  describe('hasHeader', () => {
    it('is false without title or icon, true when either is provided', () => {
      expect(component.hasHeader()).toBe(false);

      fixture.componentRef.setInput('title', 'My Title');
      expect(component.hasHeader()).toBe(true);
    });
  });

  describe('template', () => {
    it('renders the header with title and hides it when absent', () => {
      expect(fixture.debugElement.query(By.css('mat-expansion-panel-header'))).toBeNull();

      fixture.componentRef.setInput('title', 'Card Title');
      fixture.detectChanges();
      const header = fixture.debugElement.query(By.css('mat-expansion-panel-header'));
      expect(header).toBeTruthy();
      expect(header.nativeElement.textContent).toContain('Card Title');
    });

    it('shows toggle icon with rotated state based on expanded input', () => {
      fixture.componentRef.setInput('title', 'Card');
      fixture.componentRef.setInput('isExpandable', true);

      fixture.componentRef.setInput('expanded', false);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.toggle-icon.rotated'))).toBeNull();

      fixture.componentRef.setInput('expanded', true);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.toggle-icon.rotated'))).toBeTruthy();
    });
  });
});
