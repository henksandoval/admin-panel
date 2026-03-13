import { FormControl, Validators } from '@angular/forms';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { AppFormInputComponent } from '@ui-molecules/app-form/app-form-input/app-form-input.component';
import { AppFormInputOptions } from '@ui-molecules/app-form/app-form-input/app-form-input.model';

const TEST_ID = 'test-input';

async function renderFormInput(
  control: FormControl<string>,
  config?: AppFormInputOptions,
) {
  return render(AppFormInputComponent, {
    componentInputs: { control, testId: TEST_ID, ...(config ? { config } : {}) },
  });
}

describe('AppFormInputComponent', () => {
  it('renders the initial FormControl value in the native input', async () => {
    const control = new FormControl('admin@empresa.com') as FormControl<string>;
    await renderFormInput(control);

    expect(screen.getByTestId<HTMLInputElement>(TEST_ID).value).toBe('admin@empresa.com');
  });

  it('updates the FormControl when the user types in the input', async () => {
    const control = new FormControl('') as FormControl<string>;
    await renderFormInput(control);

    await userEvent.type(screen.getByTestId(TEST_ID), 'nuevo@valor.com');

    expect(control.value).toBe('nuevo@valor.com');
  });

  it('shows the error when the control is invalid and has been touched', async () => {
    const control = new FormControl('', Validators.required) as FormControl<string>;
    control.markAsTouched();
    const { fixture } = await renderFormInput(control);
    fixture.detectChanges();

    const errorEl = screen.getByTestId(TEST_ID + '-error');
    expect(errorEl.textContent?.trim()).toBe('This field is required');
  });

  it('does not show error when the control is invalid but untouched', async () => {
    const control = new FormControl('', Validators.required) as FormControl<string>;
    await renderFormInput(control);

    expect(screen.queryByTestId(TEST_ID + '-error')).toBeNull();
  });

  it('overrides the default error message with config.errorMessages', async () => {
    const control = new FormControl('', Validators.required) as FormControl<string>;
    control.markAsTouched();
    const { fixture } = await renderFormInput(control, { errorMessages: { required: 'Email is required' } });
    fixture.detectChanges();

    expect(screen.getByTestId(TEST_ID + '-error').textContent?.trim()).toBe('Email is required');
  });

  it('disables the native input when the FormControl is disabled', async () => {
    const control = new FormControl({ value: '', disabled: true }) as FormControl<string>;
    await renderFormInput(control);

    expect(screen.getByTestId<HTMLInputElement>(TEST_ID).disabled).toBe(true);
  });

  it('has required attribute on input when Validators.required is set', async () => {
    const control = new FormControl('', Validators.required) as FormControl<string>;
    await renderFormInput(control);

    expect(screen.getByTestId<HTMLInputElement>(TEST_ID).required).toBe(true);
  });

  it('does not show error while typing (dirty only), shows error after blur (touched)', async () => {
    const control = new FormControl('', Validators.email) as FormControl<string>;
    const { fixture } = await renderFormInput(control);

    const input = screen.getByTestId(TEST_ID);
    const user = userEvent.setup();
    await user.type(input, 'invalid-text');
    fixture.detectChanges();

    expect(screen.queryByTestId(TEST_ID + '-error')).toBeNull();

    await user.tab();
    fixture.detectChanges();

    expect(screen.queryByTestId(TEST_ID + '-error')).not.toBeNull();
  });

  it('calls onIconClick handler when the icon is clicked', async () => {
    const control = new FormControl('') as FormControl<string>;
    const onIconClickSpy = vi.fn();
    await renderFormInput(control, { icon: 'visibility', onIconClick: onIconClickSpy });

    await userEvent.click(screen.getByTestId(TEST_ID + '-icon'));

    expect(onIconClickSpy).toHaveBeenCalledWith(expect.any(MouseEvent));
  });
});

