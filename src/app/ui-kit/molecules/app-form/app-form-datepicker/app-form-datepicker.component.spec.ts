import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppFormDatepickerComponent } from './app-form-datepicker.component';
import { AppFormDatepickerConnectorDirective } from './app-form-datepicker-connector.directive';
import { By } from '@angular/platform-browser';

function mockNgControl(control: FormControl): NgControl {
  return { control, valueAccessor: null } as unknown as NgControl;
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, AppFormDatepickerComponent, AppFormDatepickerConnectorDirective],
  template: `
    <form [formGroup]="form">
      <app-form-datepicker formControlName="birthDate" appFormDatepickerConnector />
    </form>
  `,
})
class HostComponent {
  form = new FormGroup({
    birthDate: new FormControl<Date | null>(null, Validators.required),
  });
}

describe('AppFormDatepickerComponent', () => {
  let fixture: ComponentFixture<AppFormDatepickerComponent>;
  let component: AppFormDatepickerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFormDatepickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFormDatepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('writeValue sets internalControl without triggering onChange', () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);
    const date = new Date(2025, 0, 15);

    component.writeValue(date);

    expect(component.internalControl.value).toBe(date);
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('writeValue with null sets internalControl to null without triggering onChange', () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.writeValue(null);

    expect(component.internalControl.value).toBeNull();
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('internalControl value change propagates to onChange', () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);
    const date = new Date(2025, 5, 20);

    component.internalControl.setValue(date);

    expect(onChangeSpy).toHaveBeenCalledWith(date);
  });

  it('handleBlur calls onTouched', () => {
    const onTouchedSpy = vi.fn();
    component.registerOnTouched(onTouchedSpy);

    component.handleBlur();

    expect(onTouchedSpy).toHaveBeenCalledOnce();
  });

  it('errorState does not show error when control has not been touched', () => {
    const control = new FormControl<Date | null>(null, Validators.required);
    component.connectControl(mockNgControl(control));

    expect(component.errorState.shouldShow).toBe(false);
  });

  it('errorState uses config errorMessages first, then defaults, then fallback', () => {
    const control = new FormControl<Date | null>(null, Validators.required);
    control.markAsTouched();
    component.connectControl(mockNgControl(control));

    expect(component.errorState.message).toBe('This field is required');

    fixture.componentRef.setInput('config', {
      errorMessages: { required: 'Custom message' },
    });

    expect(component.errorState.message).toBe('Custom message');

    control.setErrors({ unknownError: true });
    fixture.componentRef.setInput('config', { errorMessages: {} });

    expect(component.errorState.message).toBe('Validation error');
  });

  it('connectControl sets isRequired to true when Validators.required is present', () => {
    const control = new FormControl<Date | null>(null, Validators.required);
    component.connectControl(mockNgControl(control));

    expect(component.isRequired).toBe(true);
  });

  it('setDisabledState disables and re-enables internalControl', () => {
    component.setDisabledState(true);
    expect(component.internalControl.disabled).toBe(true);

    component.setDisabledState(false);
    expect(component.internalControl.enabled).toBe(true);
  });
});

describe('AppFormDatepickerConnectorDirective — integration', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('FormGroup starts with null and is invalid with Validators.required', () => {
    expect(host.form.value.birthDate).toBeNull();
    expect(host.form.invalid).toBe(true);
  });

  it('FormGroup becomes valid when a date is set via the component', () => {
    const datepickerComponent = fixture.debugElement
      .query(By.directive(AppFormDatepickerComponent))
      .componentInstance as AppFormDatepickerComponent;

    datepickerComponent.internalControl.setValue(new Date(2025, 0, 15));

    expect(host.form.value.birthDate).toEqual(new Date(2025, 0, 15));
    expect(host.form.valid).toBe(true);
  });

  it('disabling the FormControl from the FormGroup disables internalControl', () => {
    host.form.get('birthDate')!.disable();
    fixture.detectChanges();

    const datepickerComponent = fixture.debugElement
      .query(By.directive(AppFormDatepickerComponent))
      .componentInstance as AppFormDatepickerComponent;

    expect(datepickerComponent.internalControl.disabled).toBe(true);
  });
});

