import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AppFormSelectComponent } from './app-form-select.component';
import { SelectOption } from './app-form-select.model';

describe('AppFormSelectComponent', () => {
  let fixture: ComponentFixture<AppFormSelectComponent>;
  let component: AppFormSelectComponent;

  const countryOptions: SelectOption<string>[] = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
  ];

  const groupedOptions: SelectOption<string>[] = [
    { value: 'us', label: 'United States', group: 'North America' },
    { value: 'ca', label: 'Canada', group: 'North America' },
    { value: 'mx', label: 'Mexico', group: 'North America' },
    { value: 'uk', label: 'United Kingdom', group: 'Europe' },
    { value: 'fr', label: 'France', group: 'Europe' },
    { value: 'de', label: 'Germany', group: 'Europe' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFormSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFormSelectComponent);
    component = fixture.componentInstance;
  });

  it('TC-01 — renders the initial FormControl value in the select', () => {
    const control = new FormControl('us');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.detectChanges();

    const select = fixture.debugElement.query(By.css('mat-select'));
    expect(select.componentInstance.value).toBe('us');
  });

  it('TC-02 — updates the FormControl when an option is selected', () => {
    const control = new FormControl<string | null>(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.detectChanges();

    component.control().setValue('uk');
    expect(control.value).toBe('uk');
  });

  it('TC-03 — shows the error when the control is invalid and has been touched', async () => {
    const control = new FormControl(null, Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.detectChanges();

    control.markAsTouched();
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('mat-error'));
    expect(error).not.toBeNull();
    expect(error.nativeElement.textContent.trim()).toBe('This field is required');
  });

  it('TC-04 — does not show error when the control is invalid but untouched', () => {
    const control = new FormControl(null, Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('mat-error'));
    expect(error).toBeNull();
  });

  it('TC-05 — config errorMessages overrides the default error message', () => {
    const control = new FormControl(null, Validators.required);
    control.markAsTouched();
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.componentRef.setInput('config', { errorMessages: { required: 'Please select a country' } });
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('mat-error'));
    expect(error.nativeElement.textContent.trim()).toBe('Please select a country');
  });

  it('TC-06 — disables the select when the FormControl is disabled', () => {
    const control = new FormControl({ value: 'us', disabled: true });
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.detectChanges();

    const select = fixture.debugElement.query(By.css('mat-select'));
    expect(select.componentInstance.disabled).toBe(true);
  });

  it('TC-07 — isRequired is true when Validators.required is set', () => {
    const control = new FormControl(null, Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.detectChanges();

    expect(component.isRequired()).toBe(true);
  });

  it('TC-08 — renders the label when provided in config', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.componentRef.setInput('config', { label: 'Country' });
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('mat-label'));
    expect(label).not.toBeNull();
    expect(label.nativeElement.textContent.trim()).toBe('Country');
  });

  it('TC-09 — renders the hint when provided in config', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.componentRef.setInput('config', { hint: 'Select your country of residence' });
    fixture.detectChanges();

    const hint = fixture.debugElement.query(By.css('mat-hint'));
    expect(hint).not.toBeNull();
    expect(hint.nativeElement.textContent.trim()).toBe('Select your country of residence');
  });

  it('TC-10 — renders all options', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.detectChanges();

    const options = fixture.debugElement.queryAll(By.css('mat-option'));
    expect(options.length).toBe(3);
  });

  it('TC-11 — renders grouped options when group property is present', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', groupedOptions);
    fixture.detectChanges();

    expect(component.hasGroups()).toBe(true);
    const optgroups = fixture.debugElement.queryAll(By.css('mat-optgroup'));
    expect(optgroups.length).toBe(2);
  });

  it('TC-12 — renders options without groups when group property is not present', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.detectChanges();

    expect(component.hasGroups()).toBe(false);
    const optgroups = fixture.debugElement.queryAll(By.css('mat-optgroup'));
    expect(optgroups.length).toBe(0);
  });

  it('TC-13 — supports multiple selection when configured', () => {
    const control = new FormControl<string[]>(['us', 'uk']);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.componentRef.setInput('config', { multiple: true });
    fixture.detectChanges();

    const select = fixture.debugElement.query(By.css('mat-select'));
    expect(select.componentInstance.multiple).toBe(true);
  });

  it('TC-14 — applies the icon when provided in config', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.componentRef.setInput('config', { icon: 'public' });
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(icon).not.toBeNull();
    expect(icon.nativeElement.textContent.trim()).toBe('public');
  });

  it('TC-15 — renders with default appearance', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.css('mat-form-field'));
    expect(formField.componentInstance.appearance).toBe('fill');
  });

  it('TC-16 — applies custom appearance from config', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.componentRef.setInput('config', { appearance: 'outline' });
    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.css('mat-form-field'));
    expect(formField.componentInstance.appearance).toBe('outline');
  });

  it('TC-17 — disables individual options', () => {
    const optionsWithDisabled: SelectOption<string>[] = [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom', disabled: true },
      { value: 'ca', label: 'Canada' },
    ];
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', optionsWithDisabled);
    fixture.detectChanges();

    const options = fixture.debugElement.queryAll(By.css('mat-option'));
    expect(options[0].componentInstance.disabled).toBe(false);
    expect(options[1].componentInstance.disabled).toBe(true);
    expect(options[2].componentInstance.disabled).toBe(false);
  });

  it('TC-18 — handles generic types correctly', () => {
    const numberOptions: SelectOption<number>[] = [
      { value: 1, label: 'Option 1' },
      { value: 2, label: 'Option 2' },
    ];
    const control = new FormControl<number | null>(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', numberOptions);
    fixture.detectChanges();

    component.control().setValue(2);
    expect(component.control().value).toBe(2);
  });

  it('TC-19 — applies density class to host element', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', countryOptions);
    fixture.componentRef.setInput('config', { density: -2 });
    fixture.detectChanges();

    expect(component.densityClass()).toContain('app-form-select--density-n2');
  });

  it('TC-20 — groups options correctly by group name', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', groupedOptions);
    fixture.detectChanges();

    const grouped = component.groupedOptions();
    expect(grouped.length).toBe(2);
    expect(grouped[0].options.length).toBe(3);
    expect(grouped[1].options.length).toBe(3);
  });
});

