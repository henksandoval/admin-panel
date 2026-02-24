import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppToggleGroupComponent } from './app-toggle-group.component';
import { TOGGLE_GROUP_DEFAULTS } from './app-toggle-group.model';

const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
];

describe('AppToggleGroupComponent', () => {
  let fixture: ComponentFixture<AppToggleGroupComponent>;
  let component: AppToggleGroupComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppToggleGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppToggleGroupComponent);
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('creates with all default values', () => {
    expect(component.color()).toBe(TOGGLE_GROUP_DEFAULTS.color);
    expect(component.size()).toBe(TOGGLE_GROUP_DEFAULTS.size);
    expect(component.appearance()).toBe(TOGGLE_GROUP_DEFAULTS.appearance);
    expect(component.disabled()).toBe(TOGGLE_GROUP_DEFAULTS.disabled);
    expect(component.multiple()).toBe(TOGGLE_GROUP_DEFAULTS.multiple);
    expect(component.value()).toBeNull();
  });

  describe('toggleGroupClasses', () => {
    it('returns empty string with default size and appearance', () => {
      expect(component.toggleGroupClasses()).toBe('');
    });

    it('adds toggle-size-* and toggle-appearance-* when they differ from defaults', () => {
      fixture.componentRef.setInput('size', 'large');
      fixture.componentRef.setInput('appearance', 'legacy');
      const classes = component.toggleGroupClasses();
      expect(classes).toContain('toggle-size-large');
      expect(classes).toContain('toggle-appearance-legacy');
    });
  });

  describe('onToggleChange', () => {
    it('updates value model, calls onChange/onTouched, and emits changed', () => {
      const emitSpy = vi.spyOn(component.changed, 'emit');
      const onChangeSpy = vi.fn();
      const onTouchedSpy = vi.fn();
      component.registerOnChange(onChangeSpy);
      component.registerOnTouched(onTouchedSpy);

      component.onToggleChange({ value: 'a' } as any);

      expect(component.value()).toBe('a');
      expect(onChangeSpy).toHaveBeenCalledWith('a');
      expect(onTouchedSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith('a');
    });
  });

  describe('writeValue (CVA)', () => {
    it('updates the value model', () => {
      component.writeValue('b');
      expect(component.value()).toBe('b');

      component.writeValue(null);
      expect(component.value()).toBeNull();
    });
  });
});
