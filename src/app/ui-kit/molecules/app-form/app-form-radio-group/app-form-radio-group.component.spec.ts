import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AppFormRadioGroupComponent } from './app-form-radio-group.component';
import { AppFormRadioGroupConnectorDirective } from './app-form-radio-group-connector.directive';
import { RadioOption } from './app-form-radio-group.model';

const OPTIONS: RadioOption<string>[] = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
];

function mockNgControl(control: FormControl): NgControl {
  return { control, valueAccessor: null } as unknown as NgControl;
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, AppFormRadioGroupComponent, AppFormRadioGroupConnectorDirective],
  template: `
    <form [formGroup]="form">
      <app-form-radio-group
        formControlName="choice"
        [options]="options"
        appFormRadioGroupConnector />
    </form>
  `,
})
class HostComponent {
  options = OPTIONS;
  form = new FormGroup({
    choice: new FormControl<string | null>(null, Validators.required),
  });
}

describe('AppFormRadioGroupComponent', () => {
  let fixture: ComponentFixture<AppFormRadioGroupComponent<string>>;
  let component: AppFormRadioGroupComponent<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFormRadioGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFormRadioGroupComponent<string>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
  });

  it('writeValue sets internalControl without triggering onChange', () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.writeValue('a');

    expect(component.internalControl.value).toBe('a');
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

    component.internalControl.setValue('b');

    expect(onChangeSpy).toHaveBeenCalledWith('b');
  });

  it('errorState does not show error when control has not been touched', () => {
    const control = new FormControl<string | null>(null, Validators.required);
    component.connectControl(mockNgControl(control));

    expect(component.errorState.shouldShow).toBe(false);
  });

  it('errorState uses config errorMessages first, then defaults, then fallback', () => {
    const control = new FormControl<string | null>(null, Validators.required);
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
    const control = new FormControl<string | null>(null, Validators.required);
    component.connectControl(mockNgControl(control));

    expect(component.isRequired).toBe(true);
  });

  it('setDisabledState disables and re-enables internalControl', () => {
    component.setDisabledState(true);
    expect(component.isDisabled).toBe(true);
    expect(component.internalControl.disabled).toBe(true);

    component.setDisabledState(false);
    expect(component.isDisabled).toBe(false);
    expect(component.internalControl.enabled).toBe(true);
  });

  it('does not render error div when showErrors is false', () => {
    const control = new FormControl<string | null>(null, Validators.required);
    control.markAsTouched();
    component.connectControl(mockNgControl(control));
    fixture.componentRef.setInput('config', { showErrors: false });
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[role="alert"]'))).toBeNull();
  });
});

describe('AppFormRadioGroupConnectorDirective — integration', () => {
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

  it('FormGroup starts with null and invalid, becomes valid when an option is selected', () => {
    expect(host.form.value.choice).toBeNull();
    expect(host.form.invalid).toBe(true);

    const radioGroupComponent = fixture.debugElement
      .query(By.directive(AppFormRadioGroupComponent))
      .componentInstance as AppFormRadioGroupComponent<string>;

    radioGroupComponent.internalControl.setValue('a');

    expect(host.form.value.choice).toBe('a');
    expect(host.form.valid).toBe(true);
  });

  it('disabling the FormControl from the FormGroup disables internalControl', () => {
    host.form.get('choice')!.disable();
    fixture.detectChanges();

    const radioGroupComponent = fixture.debugElement
      .query(By.directive(AppFormRadioGroupComponent))
      .componentInstance as AppFormRadioGroupComponent<string>;

    expect(radioGroupComponent.internalControl.disabled).toBe(true);
  });
});

