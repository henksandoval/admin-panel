import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AppFormRadioGroupComponent } from './app-form-radio-group.component';
import { RadioOption } from './app-form-radio-group.model';

describe('AppFormRadioGroupComponent', () => {
  let fixture: ComponentFixture<AppFormRadioGroupComponent>;
  let component: AppFormRadioGroupComponent;

  const genderOptions: RadioOption<string>[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFormRadioGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFormRadioGroupComponent);
    component = fixture.componentInstance;
  });

  it('TC-01 — renders the initial FormControl value in the radio group', () => {
    const control = new FormControl('male');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', genderOptions);
    fixture.detectChanges();

    const radioGroup = fixture.debugElement.query(By.css('mat-radio-group'));
    expect(radioGroup.componentInstance.value).toBe('male');
  });

  it('TC-02 — updates the FormControl when a radio option is selected', () => {
    const control = new FormControl<string | null>(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', genderOptions);
    fixture.detectChanges();

    component.control().setValue('female');

    expect(control.value).toBe('female');
  });

  it('TC-03 — shows the error when the control is invalid and has been touched', async () => {
    const control = new FormControl(null, Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', genderOptions);
    fixture.detectChanges();

    control.markAsTouched();
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('.app-form-radio-group-error'));
    expect(error).not.toBeNull();
    expect(error.nativeElement.textContent.trim()).toBe('This field is required');
  });

  it('TC-04 — does not show error when the control is invalid but untouched', () => {
    const control = new FormControl(null, Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', genderOptions);
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('.app-form-radio-group-error'));
    expect(error).toBeNull();
  });

  it('TC-05 — config errorMessages overrides the default error message', () => {
    const control = new FormControl(null, Validators.required);
    control.markAsTouched();
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', genderOptions);
    fixture.componentRef.setInput('config', { errorMessages: { required: 'Please select a gender' } });
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('.app-form-radio-group-error'));
    expect(error.nativeElement.textContent.trim()).toBe('Please select a gender');
  });

  it('TC-06 — disables radio options when the FormControl is disabled', () => {
    const control = new FormControl({ value: 'male', disabled: true });
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', genderOptions);
    fixture.detectChanges();

    const radios = fixture.debugElement.queryAll(By.css('app-radio'));
    radios.forEach(radio => {
      expect(radio.componentInstance.disabled).toBe(true);
    });
  });

  it('TC-07 — isRequired is true when Validators.required is set', () => {
    const control = new FormControl(null, Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', genderOptions);
    fixture.detectChanges();

    expect(component.isRequired()).toBe(true);
  });

  it('TC-08 — renders the label when provided in config', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', genderOptions);
    fixture.componentRef.setInput('config', { label: 'Gender' });
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('.app-form-radio-group-label'));
    expect(label).not.toBeNull();
    expect(label.nativeElement.textContent).toContain('Gender');
  });

  it('TC-09 — renders the hint when provided in config', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', genderOptions);
    fixture.componentRef.setInput('config', { hint: 'Select your gender identity' });
    fixture.detectChanges();

    const hint = fixture.debugElement.query(By.css('.app-form-radio-group-hint'));
    expect(hint).not.toBeNull();
    expect(hint.nativeElement.textContent).toBe('Select your gender identity');
  });

  it('TC-10 — renders all radio options', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', genderOptions);
    fixture.detectChanges();

    const radios = fixture.debugElement.queryAll(By.css('app-radio'));
    expect(radios.length).toBe(3);
  });

  it('TC-11 — applies vertical layout by default', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', genderOptions);
    fixture.detectChanges();

    const radioGroup = fixture.debugElement.query(By.css('.app-form-radio-group-options'));
    expect(radioGroup.nativeElement.classList.contains('app-form-radio-group-layout-horizontal')).toBe(false);
  });

  it('TC-12 — applies horizontal layout when configured', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', genderOptions);
    fixture.componentRef.setInput('config', { layout: 'horizontal' });
    fixture.detectChanges();

    const radioGroup = fixture.debugElement.query(By.css('.app-form-radio-group-options'));
    expect(radioGroup.nativeElement.classList.contains('app-form-radio-group-layout-horizontal')).toBe(true);
  });

  it('TC-13 — disables individual options when marked as disabled', () => {
    const optionsWithDisabled: RadioOption<string>[] = [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female', disabled: true },
      { value: 'other', label: 'Other' },
    ];
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', optionsWithDisabled);
    fixture.detectChanges();

    const radios = fixture.debugElement.queryAll(By.css('app-radio'));
    expect(radios[0].componentInstance.disabled).toBe(false);
    expect(radios[1].componentInstance.disabled).toBe(true);
    expect(radios[2].componentInstance.disabled).toBe(false);
  });

  it('TC-14 — renders required indicator when isRequired is true', () => {
    const control = new FormControl(null, Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', genderOptions);
    fixture.componentRef.setInput('config', { label: 'Gender' });
    fixture.detectChanges();

    const requiredIndicator = fixture.debugElement.query(By.css('.app-form-radio-group-label span'));
    expect(requiredIndicator).not.toBeNull();
    expect(requiredIndicator.nativeElement.textContent).toBe('*');
  });

  it('TC-15 — handles generic types correctly', () => {
    const numberOptions: RadioOption<number>[] = [
      { value: 1, label: 'Option 1' },
      { value: 2, label: 'Option 2' },
    ];
    const control = new FormControl<number | null>(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', numberOptions);
    fixture.detectChanges();

    control.setValue(2);
    expect(control.value).toBe(2);
  });
});

