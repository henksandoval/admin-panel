import { FormControl, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { AppFormDatepickerComponent } from './app-form-datepicker.component';

const TEST_ID = 'datepicker-input';

async function renderDatepicker(options: {
  control: FormControl<Date | null>;
  config?: object;
}) {
  await render(AppFormDatepickerComponent, {
    inputs: {
      control: options.control,
      config: options.config ?? {},
      testId: TEST_ID,
    },
  });
}

describe('AppFormDatepickerComponent', () => {
  it('renders the initial FormControl value in the datepicker input', async () => {
    const testDate = new Date(2024, 0, 15);
    const control = new FormControl<Date | null>(testDate);

    await renderDatepicker({ control });

    const input = screen.getByTestId<HTMLInputElement>(TEST_ID);
    expect(input.value).toBeTruthy();
  });

  it('updates the FormControl when a date value is set programmatically', async () => {
    const control = new FormControl<Date | null>(null);

    await renderDatepicker({ control });

    const testDate = new Date(2024, 0, 15);
    control.setValue(testDate);

    expect(control.value).toEqual(testDate);
  });

  it('shows the required error message when the control is invalid and touched', async () => {
    const control = new FormControl<Date | null>(null, Validators.required);

    await renderDatepicker({ control });

    control.markAsTouched();
    control.updateValueAndValidity();

    const error = await screen.findByTestId('datepicker-error');
    expect(error.textContent?.trim()).toBe('This field is required');
  });

  it('does not show an error when the control is invalid but untouched', async () => {
    const control = new FormControl<Date | null>(null, Validators.required);

    await renderDatepicker({ control });

    expect(screen.queryByTestId('datepicker-error')).toBeNull();
  });

  it('displays a custom error message when config errorMessages overrides the default', async () => {
    const control = new FormControl<Date | null>(null, Validators.required);
    control.markAsTouched();

    await renderDatepicker({ control, config: { errorMessages: { required: 'Birth date is required' } } });

    const error = screen.getByTestId('datepicker-error');
    expect(error.textContent?.trim()).toBe('Birth date is required');
  });

  it('disables the input when the FormControl is disabled', async () => {
    const control = new FormControl<Date | null>({ value: null, disabled: true });

    await renderDatepicker({ control });

    const input = screen.getByTestId<HTMLInputElement>(TEST_ID);
    expect(input.disabled).toBe(true);
  });

  it('marks the input as required when Validators.required is set on the control', async () => {
    const control = new FormControl<Date | null>(null, Validators.required);

    await renderDatepicker({ control });

    const input = screen.getByTestId<HTMLInputElement>(TEST_ID);
    expect(input.required).toBe(true);
  });

  it('shows a matDatepickerMax error when the date exceeds the configured maxDate', async () => {
    const maxDate = new Date(2024, 0, 31);
    const control = new FormControl<Date | null>(new Date(2025, 0, 1));
    control.markAsTouched();

    await renderDatepicker({ control, config: { maxDate, errorMessages: { matDatepickerMax: 'Date is too late' } } });

    control.setErrors({ matDatepickerMax: { max: maxDate, actual: control.value } });
    control.updateValueAndValidity();

    const error = await screen.findByTestId('datepicker-error');
    expect(error.textContent?.trim()).toBe('Date is too late');
  });

  it('applies minDate and maxDate from config to the datepicker input', async () => {
    const minDate = new Date(2000, 0, 1);
    const maxDate = new Date(2030, 11, 31);
    const control = new FormControl<Date | null>(new Date(2025, 5, 15));
    control.markAsTouched();

    await renderDatepicker({ control, config: { minDate, maxDate } });

    expect(screen.queryByTestId('datepicker-error')).toBeNull();
  });

  it('renders the datepicker toggle button', async () => {
    const control = new FormControl<Date | null>(null);

    await renderDatepicker({ control });

    expect(screen.getByTestId('datepicker-toggle')).toBeTruthy();
  });

  it('renders the label when provided in config', async () => {
    const control = new FormControl<Date | null>(null);

    await renderDatepicker({ control, config: { label: 'Birth Date' } });

    const label = screen.getByTestId('datepicker-label');
    expect(label.textContent?.trim()).toBe('Birth Date');
  });

  it('renders the placeholder when provided in config', async () => {
    const control = new FormControl<Date | null>(null);

    await renderDatepicker({ control, config: { placeholder: 'MM/DD/YYYY' } });

    const input = screen.getByTestId<HTMLInputElement>(TEST_ID);
    expect(input.placeholder).toBe('MM/DD/YYYY');
  });

  it('renders the hint when provided in config', async () => {
    const control = new FormControl<Date | null>(null);

    await renderDatepicker({ control, config: { hint: 'You must be 18 or older' } });

    const hint = screen.getByTestId('datepicker-hint');
    expect(hint.textContent?.trim()).toBe('You must be 18 or older');
  });
});

