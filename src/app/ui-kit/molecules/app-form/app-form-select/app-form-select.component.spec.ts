import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AppFormSelectComponent } from './app-form-select.component';
import { AppFormSelectConnectorDirective } from './app-form-select-connector.directive';
import { SelectOption } from './app-form-select.model';

const OPTIONS: SelectOption<string>[] = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
];

const GROUPED_OPTIONS: SelectOption<string>[] = [
  { value: 'a', label: 'Option A', group: 'Group 1' },
  { value: 'b', label: 'Option B', group: 'Group 2' },
];

function mockNgControl(control: FormControl): NgControl {
  return { control, valueAccessor: null } as unknown as NgControl;
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, AppFormSelectComponent, AppFormSelectConnectorDirective],
  template: `
    <form [formGroup]="form">
      <app-form-select
        formControlName="country"
        [options]="options"
        appFormSelectConnector />
    </form>
  `,
})
class HostComponent {
  options = OPTIONS;
  form = new FormGroup({
    country: new FormControl<string | null>(null, Validators.required),
  });
}

describe('AppFormSelectComponent', () => {
  let fixture: ComponentFixture<AppFormSelectComponent<string>>;
  let component: AppFormSelectComponent<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFormSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFormSelectComponent<string>);
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

  it('writeValue accepts arrays for multiple selection without triggering onChange', () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.writeValue(['a', 'b']);

    expect(component.internalControl.value).toEqual(['a', 'b']);
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('internalControl value change propagates to onChange', () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.internalControl.setValue('b');

    expect(onChangeSpy).toHaveBeenCalledWith('b');
  });

  it('handleBlur calls onTouched', () => {
    const onTouchedSpy = vi.fn();
    component.registerOnTouched(onTouchedSpy);

    component.handleBlur();

    expect(onTouchedSpy).toHaveBeenCalledOnce();
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

  it('hasGroups returns false for flat options and true when any option has a group', () => {
    expect(component.hasGroups()).toBe(false);

    fixture.componentRef.setInput('options', GROUPED_OPTIONS);

    expect(component.hasGroups()).toBe(true);
  });
});

describe('AppFormSelectConnectorDirective — integration', () => {
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
    expect(host.form.value.country).toBeNull();
    expect(host.form.invalid).toBe(true);

    const selectComponent = fixture.debugElement
      .query(By.directive(AppFormSelectComponent))
      .componentInstance as AppFormSelectComponent<string>;

    selectComponent.internalControl.setValue('a');

    expect(host.form.value.country).toBe('a');
    expect(host.form.valid).toBe(true);
  });

  it('disabling the FormControl from the FormGroup disables internalControl', () => {
    host.form.get('country')!.disable();
    fixture.detectChanges();

    const selectComponent = fixture.debugElement
      .query(By.directive(AppFormSelectComponent))
      .componentInstance as AppFormSelectComponent<string>;

    expect(selectComponent.internalControl.disabled).toBe(true);
  });
});

