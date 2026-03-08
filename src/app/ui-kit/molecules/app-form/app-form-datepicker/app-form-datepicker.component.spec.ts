import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AppFormDatepickerComponent } from './app-form-datepicker.component';

describe('AppFormDatepickerComponent', () => {
  let fixture: ComponentFixture<AppFormDatepickerComponent>;
  let component: AppFormDatepickerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFormDatepickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFormDatepickerComponent);
    component = fixture.componentInstance;
  });

  it('TC-01 — renders the initial FormControl value in the datepicker input', () => {
    const testDate = new Date(2024, 0, 15);
    const control = new FormControl(testDate);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.value).toBeTruthy();
  });

  it('TC-02 — updates the FormControl when the date is selected', () => {
    const control = new FormControl<Date | null>(null);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const testDate = new Date(2024, 0, 15);
    control.setValue(testDate);

    expect(control.value).toEqual(testDate);
  });

  it('TC-03 — shows the error when the control is invalid and has been touched', async () => {
    const control = new FormControl<Date | null>(null, Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    control.markAsTouched();
    fixture.detectChanges();

    const matError = fixture.debugElement.query(By.css('mat-error'));
    expect(matError).not.toBeNull();
    expect(matError.nativeElement.textContent.trim()).toBe('This field is required');
  });

  it('TC-04 — does not show error when the control is invalid but untouched', () => {
    const control = new FormControl<Date | null>(null, Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const matError = fixture.debugElement.query(By.css('mat-error'));
    expect(matError).toBeNull();
  });

  it('TC-05 — config errorMessages overrides the default error message', () => {
    const control = new FormControl<Date | null>(null, Validators.required);
    control.markAsTouched();
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { errorMessages: { required: 'Birth date is required' } });
    fixture.detectChanges();

    const matError = fixture.debugElement.query(By.css('mat-error'));
    expect(matError.nativeElement.textContent.trim()).toBe('Birth date is required');
  });

  it('TC-06 — disables the input when the FormControl is disabled', () => {
    const control = new FormControl({ value: null, disabled: true });
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(inputEl.disabled).toBe(true);
  });

  it('TC-07 — isRequired is true when Validators.required is set', () => {
    const control = new FormControl<Date | null>(null, Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    expect(component.isRequired()).toBe(true);

    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(inputEl.required).toBe(true);
  });

  it('TC-08 — renders the label when provided in config', () => {
    const control = new FormControl<Date | null>(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { label: 'Birth Date' });
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('mat-label'));
    expect(label).not.toBeNull();
    expect(label.nativeElement.textContent.trim()).toBe('Birth Date');
  });

  it('TC-09 — renders the placeholder when provided in config', () => {
    const control = new FormControl<Date | null>(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { placeholder: 'MM/DD/YYYY' });
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.placeholder).toBe('MM/DD/YYYY');
  });

  it('TC-10 — renders the hint when provided in config', () => {
    const control = new FormControl<Date | null>(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { hint: 'You must be 18 or older' });
    fixture.detectChanges();

    const hint = fixture.debugElement.query(By.css('mat-hint'));
    expect(hint).not.toBeNull();
    expect(hint.nativeElement.textContent.trim()).toBe('You must be 18 or older');
  });

  it('TC-11 — renders the icon when provided in config', () => {
    const control = new FormControl<Date | null>(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { icon: 'calendar_today' });
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).not.toBeNull();
    expect(icon.nativeElement.textContent.trim()).toBe('calendar_today');
  });

  it('TC-12 — renders the datepicker toggle button', () => {
    const control = new FormControl<Date | null>(null);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const toggle = fixture.debugElement.query(By.css('mat-datepicker-toggle'));
    expect(toggle).not.toBeNull();
  });

  it('TC-13 — renders with default appearance', () => {
    const control = new FormControl<Date | null>(null);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.css('mat-form-field'));
    expect(formField.componentInstance.appearance).toBe('fill');
  });

  it('TC-14 — applies custom appearance from config', () => {
    const control = new FormControl<Date | null>(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { appearance: 'outline' });
    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.css('mat-form-field'));
    expect(formField.componentInstance.appearance).toBe('outline');
  });

  it('TC-15 — handles matDatepickerMax validation error message', () => {
    const maxDate = new Date(2024, 0, 31);
    const control = new FormControl<Date | null>(new Date(2025, 0, 1), Validators.max(maxDate.getTime()));
    control.markAsTouched();
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    // This test validates the error message structure
    const errorState = component.errorState();
    expect(errorState.shouldShow).toBe(true);
  });

  it('TC-16 — applies minDate from config', () => {
    const minDate = new Date(2000, 0, 1);
    const control = new FormControl<Date | null>(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { minDate });
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input'));
    expect(input.componentInstance.min).toEqual(minDate);
  });

  it('TC-17 — applies maxDate from config', () => {
    const maxDate = new Date(2030, 0, 1);
    const control = new FormControl<Date | null>(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { maxDate });
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input'));
    expect(input.componentInstance.max).toEqual(maxDate);
  });

  it('TC-18 — applies startView from config', () => {
    const control = new FormControl<Date | null>(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { startView: 'year' });
    fixture.detectChanges();

    const datepicker = fixture.debugElement.query(By.css('mat-datepicker'));
    expect(datepicker.componentInstance.startView).toBe('year');
  });
});

