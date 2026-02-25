import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AppFormCheckboxComponent } from './app-form-checkbox.component';
import { AppFormCheckboxConnectorDirective } from './app-form-checkbox-connector.directive';

function mockNgControl(control: FormControl): NgControl {
  return { control, valueAccessor: null } as unknown as NgControl;
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, AppFormCheckboxComponent, AppFormCheckboxConnectorDirective],
  template: `
    <form [formGroup]="form">
      <app-form-checkbox formControlName="accepted" appFormCheckboxConnector>
        Accept terms
      </app-form-checkbox>
    </form>
  `,
})
class HostComponent {
  form = new FormGroup({
    accepted: new FormControl(false, Validators.requiredTrue),
  });
}

describe('AppFormCheckboxComponent', () => {
  let fixture: ComponentFixture<AppFormCheckboxComponent>;
  let component: AppFormCheckboxComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFormCheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFormCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('writeValue with null falls back to false without triggering onChange', () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.writeValue(null as unknown as boolean);

    expect(component.internalControl.value).toBe(false);
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('onCheckboxChange propagates value via onChange and marks as touched', () => {
    const onChangeSpy = vi.fn();
    const onTouchedSpy = vi.fn();
    component.registerOnChange(onChangeSpy);
    component.registerOnTouched(onTouchedSpy);

    component.onCheckboxChange(true);

    expect(onChangeSpy).toHaveBeenCalledWith(true);
    expect(onTouchedSpy).toHaveBeenCalledOnce();
  });

  it('errorState does not show error when control has not been touched', () => {
    const control = new FormControl(false, Validators.requiredTrue);
    component.connectControl(mockNgControl(control));

    expect(component.errorState.shouldShow).toBe(false);
  });

  it('errorState uses config errorMessages first, then defaults, then fallback', () => {
    const control = new FormControl(false, Validators.requiredTrue);
    control.markAsTouched();
    component.connectControl(mockNgControl(control));

    expect(component.errorState.message).toBe('This field must be checked');

    fixture.componentRef.setInput('config', {
      errorMessages: { required: 'Custom message' },
    });

    expect(component.errorState.message).toBe('Custom message');

    control.setErrors({ unknownError: true });
    fixture.componentRef.setInput('config', { errorMessages: {} });

    expect(component.errorState.message).toBe('Validation error');
  });

  it.each([
    { validator: Validators.required, label: 'required' },
    { validator: Validators.requiredTrue, label: 'requiredTrue' },
  ])('connectControl sets isRequired to true for $label validator', ({ validator }) => {
    const control = new FormControl(false, validator);
    component.connectControl(mockNgControl(control));

    expect(component.isRequired).toBe(true);
  });

  it('setDisabledState syncs isDisabled and internalControl in both directions', () => {
    component.setDisabledState(true);
    expect(component.isDisabled).toBe(true);
    expect(component.internalControl.disabled).toBe(true);

    component.setDisabledState(false);
    expect(component.isDisabled).toBe(false);
    expect(component.internalControl.enabled).toBe(true);
  });

  it('does not render error div when showErrors is false', () => {
    const control = new FormControl(false, Validators.requiredTrue);
    control.markAsTouched();
    component.connectControl(mockNgControl(control));
    fixture.componentRef.setInput('config', { showErrors: false });
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[role="alert"]'))).toBeNull();
  });
});

describe('AppFormCheckboxConnectorDirective — integration', () => {
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

  it('FormGroup receives false when checkbox is unchecked', () => {
    expect(host.form.value.accepted).toBe(false);
  });

  it('FormGroup becomes invalid with Validators.requiredTrue when value is false', () => {
    expect(host.form.invalid).toBe(true);
  });

  it('FormGroup becomes valid when checkbox is checked via the component', () => {
    const checkboxComponent = fixture.debugElement
      .query(By.directive(AppFormCheckboxComponent))
      .componentInstance as AppFormCheckboxComponent;

    checkboxComponent.onCheckboxChange(true);

    expect(host.form.value.accepted).toBe(true);
    expect(host.form.valid).toBe(true);
  });

  it('disabling the FormControl propagates disabled state to the component', () => {
    host.form.get('accepted')!.disable();
    fixture.detectChanges();

    const checkboxComponent = fixture.debugElement
      .query(By.directive(AppFormCheckboxComponent))
      .componentInstance as AppFormCheckboxComponent;

    expect(checkboxComponent.isDisabled).toBe(true);
  });
});






