import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppButtonComponent } from './app-button.component';
import { BUTTON_DEFAULTS } from './app-button.model';

describe('AppButtonComponent', () => {
  let fixture: ComponentFixture<AppButtonComponent>;
  let component: AppButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates with all default values', () => {
    expect(component.variant()).toBe(BUTTON_DEFAULTS.variant);
    expect(component.color()).toBe(BUTTON_DEFAULTS.color);
    expect(component.shape()).toBe(BUTTON_DEFAULTS.shape);
    expect(component.size()).toBe(BUTTON_DEFAULTS.size);
    expect(component.type()).toBe(BUTTON_DEFAULTS.type);
    expect(component.disabled()).toBe(BUTTON_DEFAULTS.disabled);
  });

  describe('buttonClasses', () => {
    it('returns empty string when shape and size are defaults', () => {
      expect(component.buttonClasses()).toBe('');
    });

    it('returns both classes when shape and size differ from defaults', () => {
      fixture.componentRef.setInput('shape', 'square');
      fixture.componentRef.setInput('size', 'large');

      const classes = component.buttonClasses();
      expect(classes).toContain('btn-shape-square');
      expect(classes).toContain('btn-size-large');
    });
  });

  describe('icons', () => {
    it('renders no icons when iconBefore and iconAfter are not provided', () => {
      expect(fixture.debugElement.queryAll(By.css('mat-icon')).length).toBe(0);
    });

    it('renders mat-icon before content when iconBefore is provided', () => {
      fixture.componentRef.setInput('iconBefore', 'add');
      fixture.detectChanges();
      const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
      expect(icons.length).toBe(1);
      expect(icons[0].nativeElement.textContent.trim()).toBe('add');
    });

    it('renders mat-icon after content when iconAfter is provided', () => {
      fixture.componentRef.setInput('iconAfter', 'arrow_forward');
      fixture.detectChanges();
      const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
      expect(icons.length).toBe(1);
      expect(icons[0].nativeElement.textContent.trim()).toBe('arrow_forward');
    });
  });

  describe('clicked output', () => {
    it('emits clicked on click', () => {
      const emitSpy = vi.spyOn(component.clicked, 'emit');
      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(emitSpy).toHaveBeenCalledOnce();
    });

    it('does not emit clicked when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const emitSpy = vi.spyOn(component.clicked, 'emit');
      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });
});
