import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AppFormCheckboxComponent } from './app-form-checkbox.component';

describe('AppFormCheckboxComponent', () => {
  let fixture: ComponentFixture<AppFormCheckboxComponent>;
  let component: AppFormCheckboxComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFormCheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFormCheckboxComponent);
    component = fixture.componentInstance;
  });

  it('TC-01 — renders the initial FormControl value in the checkbox', () => {
    const control = new FormControl(true);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.css('app-checkbox'));
    expect(checkbox.componentInstance.checked).toBe(true);
  });

  it('TC-02 — updates the FormControl when the checkbox is toggled', () => {
    const control = new FormControl(false);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    component.onCheckboxChange(true);

    expect(control.value).toBe(true);
  });

  it('TC-03 — shows the error when the control is invalid and has been touched', async () => {
    const control = new FormControl(false, Validators.requiredTrue);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    control.markAsTouched();
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('.app-form-checkbox-error'));
    expect(error).not.toBeNull();
    expect(error.nativeElement.textContent.trim()).toBe('You must accept this to continue');
  });

  it('TC-04 — does not show error when the control is invalid but untouched', () => {
    const control = new FormControl(false, Validators.requiredTrue);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('.app-form-checkbox-error'));
    expect(error).toBeNull();
  });

  it('TC-05 — config errorMessages overrides the default error message', () => {
    const control = new FormControl(false, Validators.requiredTrue);
    control.markAsTouched();
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { errorMessages: { requiredTrue: 'You must accept the terms' } });
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('.app-form-checkbox-error'));
    expect(error.nativeElement.textContent.trim()).toBe('You must accept the terms');
  });

  it('TC-06 — disables the checkbox when the FormControl is disabled', () => {
    const control = new FormControl({ value: false, disabled: true });
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.css('app-checkbox'));
    expect(checkbox.componentInstance.disabled).toBe(true);
  });

  it('TC-07 — isRequired is true when Validators.requiredTrue is set', () => {
    const control = new FormControl(false, Validators.requiredTrue);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    expect(component.isRequired()).toBe(true);

    const checkbox = fixture.debugElement.query(By.css('app-checkbox'));
    expect(checkbox.componentInstance.required).toBe(true);
  });

  it('TC-08 — marks control as touched when checkbox is changed', () => {
    const control = new FormControl(false);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    component.onCheckboxChange(true);

    expect(control.touched).toBe(true);
  });

  it('TC-09 — renders content with ng-content', () => {
    const control = new FormControl(false);

    @Component({
      standalone: true,
      imports: [AppFormCheckboxComponent],
      template: `
        <app-form-checkbox [control]="control">
          <span class="test-content">Accept terms</span>
        </app-form-checkbox>
      `
    })
    class TestHostComponent {
      control = control;
    }

    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const content = hostFixture.debugElement.query(By.css('.test-content'));
    expect(content).not.toBeNull();
    expect(content.nativeElement.textContent).toBe('Accept terms');
  });

  it('TC-10 — applies color from config', () => {
    const control = new FormControl(false);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { color: 'accent' });
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.css('app-checkbox'));
    expect(checkbox.componentInstance.color).toBe('accent');
  });

  it('TC-11 — applies size from config', () => {
    const control = new FormControl(false);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { size: 'large' });
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.css('app-checkbox'));
    expect(checkbox.componentInstance.size).toBe('large');
  });

  it('TC-12 — applies labelPosition from config', () => {
    const control = new FormControl(false);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { labelPosition: 'before' });
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.css('app-checkbox'));
    expect(checkbox.componentInstance.labelPosition).toBe('before');
  });

  it('TC-13 — isRequired is true when Validators.required is set', () => {
    const control = new FormControl(false, Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    expect(component.isRequired()).toBe(true);
  });

  it('TC-14 — handles custom error messages for required validator', () => {
    const control = new FormControl(false, Validators.required);
    control.markAsTouched();
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { errorMessages: { required: 'This is required' } });
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('.app-form-checkbox-error'));
    expect(error.nativeElement.textContent.trim()).toBe('This is required');
  });

  it('TC-15 — renders with default indeterminate as false', () => {
    const control = new FormControl(false);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.css('app-checkbox'));
    expect(checkbox.componentInstance.indeterminate).toBe(false);
  });

  it('TC-16 — applies indeterminate from config', () => {
    const control = new FormControl(false);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('config', { indeterminate: true });
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.css('app-checkbox'));
    expect(checkbox.componentInstance.indeterminate).toBe(true);
  });
});

// Helper component for testing ng-content
import { Component } from '@angular/core';

