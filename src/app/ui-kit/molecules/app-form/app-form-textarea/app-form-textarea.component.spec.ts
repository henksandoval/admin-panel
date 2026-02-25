import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppFormTextareaComponent } from './app-form-textarea.component';
import { AppFormTextareaConnectorDirective } from './app-form-textarea-connector.directive';
import { By } from '@angular/platform-browser';

function mockNgControl(control: FormControl): NgControl {
  return { control, valueAccessor: null } as unknown as NgControl;
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, AppFormTextareaComponent, AppFormTextareaConnectorDirective],
  template: `
    <form [formGroup]="form">
      <app-form-textarea formControlName="description" appFormTextareaConnector />
    </form>
  `,
})
class HostComponent {
  form = new FormGroup({
    description: new FormControl('', Validators.required),
  });
}

describe('AppFormTextareaComponent', () => {
  let fixture: ComponentFixture<AppFormTextareaComponent>;
  let component: AppFormTextareaComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFormTextareaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFormTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('writeValue sets internalControl without triggering onChange', () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.writeValue('hello');

    expect(component.internalControl.value).toBe('hello');
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('writeValue with null falls back to empty string without triggering onChange', () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.writeValue(null as unknown as string);

    expect(component.internalControl.value).toBe('');
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('internalControl value change propagates to onChange', () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);

    component.internalControl.setValue('typed text');

    expect(onChangeSpy).toHaveBeenCalledWith('typed text');
  });

  it('handleBlur calls onTouched', () => {
    const onTouchedSpy = vi.fn();
    component.registerOnTouched(onTouchedSpy);

    component.handleBlur();

    expect(onTouchedSpy).toHaveBeenCalledOnce();
  });

  it('errorState does not show error when control has not been touched', () => {
    const control = new FormControl('', Validators.required);
    component.connectControl(mockNgControl(control));

    expect(component.errorState.shouldShow).toBe(false);
  });

  it('errorState uses config errorMessages first, then defaults, then fallback', () => {
    const control = new FormControl('', Validators.required);
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
    const control = new FormControl('', Validators.required);
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

describe('AppFormTextareaConnectorDirective — integration', () => {
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

  it('FormGroup starts with empty string and invalid, becomes valid when text is entered', () => {
    expect(host.form.value.description).toBe('');
    expect(host.form.invalid).toBe(true);

    const textareaComponent = fixture.debugElement
      .query(By.directive(AppFormTextareaComponent))
      .componentInstance as AppFormTextareaComponent;

    textareaComponent.internalControl.setValue('some text');

    expect(host.form.value.description).toBe('some text');
    expect(host.form.valid).toBe(true);
  });

  it('disabling the FormControl from the FormGroup disables internalControl', () => {
    host.form.get('description')!.disable();
    fixture.detectChanges();

    const textareaComponent = fixture.debugElement
      .query(By.directive(AppFormTextareaComponent))
      .componentInstance as AppFormTextareaComponent;

    expect(textareaComponent.internalControl.disabled).toBe(true);
  });
});

