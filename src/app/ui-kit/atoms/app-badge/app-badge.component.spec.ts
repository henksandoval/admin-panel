import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppBadgeComponent } from './app-badge.component';
import { BADGE_DEFAULTS } from './app-badge.model';

describe('AppBadgeComponent', () => {
  let fixture: ComponentFixture<AppBadgeComponent>;
  let component: AppBadgeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates with all default values', () => {
    expect(component.variant()).toBe(BADGE_DEFAULTS.variant);
    expect(component.color()).toBe(BADGE_DEFAULTS.inlineColor);
    expect(component.size()).toBe(BADGE_DEFAULTS.size);
    expect(component.content()).toBe(BADGE_DEFAULTS.content);
    expect(component.position()).toBe(BADGE_DEFAULTS.position);
    expect(component.overlap()).toBe(BADGE_DEFAULTS.overlap);
    expect(component.hidden()).toBe(BADGE_DEFAULTS.hidden);
    expect(component.hasIndicator()).toBe(BADGE_DEFAULTS.hasIndicator);
  });

  describe('inlineClasses', () => {
    it('always includes app-badge and current color', () => {
      const classes = component.inlineClasses();
      expect(classes).toContain('app-badge');
      expect(classes).toContain(BADGE_DEFAULTS.inlineColor);
    });

    it('adds has-indicator when hasIndicator is true', () => {
      fixture.componentRef.setInput('hasIndicator', true);
      expect(component.inlineClasses()).toContain('has-indicator');
    });

    it('does not add has-indicator when hasIndicator is false', () => {
      expect(component.inlineClasses()).not.toContain('has-indicator');
    });

    it('adds badge-size-* only when size differs from default', () => {
      expect(component.inlineClasses()).not.toContain('badge-size-');

      fixture.componentRef.setInput('size', 'large');
      expect(component.inlineClasses()).toContain('badge-size-large');
    });
  });

  describe('overlayColor', () => {
    it('returns the color when it is a valid Material color', () => {
      fixture.componentRef.setInput('color', 'accent');
      expect(component.overlayColor()).toBe('accent');

      fixture.componentRef.setInput('color', 'warn');
      expect(component.overlayColor()).toBe('warn');
    });

    it('falls back to primary for non-Material colors', () => {
      for (const color of ['normal', 'info', 'success', 'warning', 'error'] as const) {
        fixture.componentRef.setInput('color', color);
        expect(component.overlayColor()).toBe('primary');
      }
    });
  });

  describe('matBadgeSize', () => {
    it('returns medium when size is the default', () => {
      expect(component.matBadgeSize()).toBe(BADGE_DEFAULTS.size);
    });

    it('returns the actual size when it differs from default', () => {
      fixture.componentRef.setInput('size', 'small');
      expect(component.matBadgeSize()).toBe('small');

      fixture.componentRef.setInput('size', 'large');
      expect(component.matBadgeSize()).toBe('large');
    });
  });

  describe('template variant', () => {
    it('renders a span for inline variant', () => {
      expect(fixture.debugElement.query(By.css('span'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('div[ng-reflect-mat-badge]'))).toBeNull();
    });

    it('renders a div with matBadge for overlay variant', () => {
      fixture.componentRef.setInput('variant', 'overlay');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('div'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('span'))).toBeNull();
    });

    it('applies aria-label attribute when provided', () => {
      fixture.componentRef.setInput('ariaLabel', 'notifications');
      fixture.detectChanges();
      const el = fixture.debugElement.query(By.css('span'));
      expect(el.nativeElement.getAttribute('aria-label')).toBe('notifications');
    });
  });
});
