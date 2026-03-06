import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AppFormInputNewComponent } from '@ui-molecules/app-form/app-form-input-new/app-form-input-new.component';

describe('AppFormInputNewComponent', () => {
  let fixture: ComponentFixture<AppFormInputNewComponent>;
  let component: AppFormInputNewComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFormInputNewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFormInputNewComponent);
    component = fixture.componentInstance;
  });

  it('TC-01 — renders the initial FormControl value in the native input', () => {
    const control = new FormControl('admin@empresa.com');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.value).toBe('admin@empresa.com');
  });

  it('TC-02 — updates the FormControl when the user types in the input', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    inputEl.value = 'nuevo@valor.com';
    inputEl.dispatchEvent(new Event('input'));

    expect(control.value).toBe('nuevo@valor.com');
  });

  it('TC-03 — shows the error when the control is invalid and has been touched', async () => {
    const control = new FormControl('', Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    control.markAsTouched();
    fixture.detectChanges();

    const matError = fixture.debugElement.query(By.css('mat-error'));
    expect(matError).not.toBeNull();
    expect(matError.nativeElement.textContent.trim()).toBe('This field is required');
  });

  it('TC-04 — does not show error when the control is invalid but untouched', () => {
    const control = new FormControl('', Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const matError = fixture.debugElement.query(By.css('mat-error'));
    expect(matError).toBeNull();
  });

  it('TC-05 — config errorMessages overrides the default error message', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { errorMessages: { required: 'Email is required' } });
    fixture.detectChanges();

    const matError = fixture.debugElement.query(By.css('mat-error'));
    expect(matError.nativeElement.textContent.trim()).toBe('Email is required');
  });

  it('TC-06 — disables the native input when the FormControl is disabled', () => {
    const control = new FormControl({ value: '', disabled: true });
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(inputEl.disabled).toBe(true);
  });

  it('TC-07 — isRequired is true and the input has required attribute when Validators.required is set', () => {
    const control = new FormControl('', Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    expect(component.isRequired()).toBe(true);

    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(inputEl.required).toBe(true);
  });

  it('TC-08 — does not show error while typing (dirty only), shows error after blur (touched)', () => {
    const control = new FormControl('', Validators.email);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    inputEl.value = 'invalid-text';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.errorState().shouldShow).toBe(false);

    inputEl.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(component.errorState().shouldShow).toBe(true);
  });

});

