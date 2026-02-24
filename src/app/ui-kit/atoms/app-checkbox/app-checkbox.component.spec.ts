import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppCheckboxComponent } from './app-checkbox.component';

describe('AppCheckboxComponent', () => {
  let fixture: ComponentFixture<AppCheckboxComponent>;
  let component: AppCheckboxComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppCheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates with all default values', () => {
    expect(component.checked()).toBe(false);
    expect(component.color()).toBe('primary');
    expect(component.size()).toBe('medium');
    expect(component.labelPosition()).toBe('after');
    expect(component.disabled()).toBe(false);
    expect(component.indeterminate()).toBe(false);
    expect(component.required()).toBe(false);
  });

  describe('checkboxClasses', () => {
    it('returns empty string when size is medium', () => {
      expect(component.checkboxClasses()).toBe('');
    });

    it('adds checkbox-size-* class when size differs from medium', () => {
      fixture.componentRef.setInput('size', 'small');
      expect(component.checkboxClasses()).toBe('checkbox-size-small');

      fixture.componentRef.setInput('size', 'large');
      expect(component.checkboxClasses()).toBe('checkbox-size-large');
    });
  });

  describe('onCheckboxChange', () => {
    it('updates checked model and emits changed', () => {
      const emitSpy = vi.spyOn(component.changed, 'emit');

      component.onCheckboxChange({ checked: true } as any);

      expect(component.checked()).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(true);
    });

    it('does not emit clicked when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const emitSpy = vi.spyOn(component.changed, 'emit');
      fixture.debugElement.query(By.css('input[type=checkbox]')).nativeElement.click();
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });
});
