import { FormControl, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { AppFormCheckboxComponent } from './app-form-checkbox.component';
import { AppFormCheckboxNewOptions } from './app-form-checkbox.model';

async function renderFormCheckbox(options: {
  control: FormControl<boolean>;
  config?: AppFormCheckboxNewOptions;
  label?: string;
}) {
  const { control, config = {}, label = 'Label' } = options;

  const { fixture } = await render(
    `<app-form-checkbox [control]="control" [config]="config">${label}</app-form-checkbox>`,
    {
      imports: [AppFormCheckboxComponent],
      componentProperties: { control, config },
    }
  );

  return { fixture };
}

describe('AppFormCheckboxComponent', () => {
  it('reflects the initial FormControl value in the checkbox', async () => {
    const control = new FormControl<boolean>(true, { nonNullable: true });
    await renderFormCheckbox({ control });

    expect((screen.getByRole('checkbox')).checked).toBe(true);
  });

  it('updates the FormControl value when the checkbox is toggled', async () => {
    const control = new FormControl<boolean>(false, { nonNullable: true });
    await renderFormCheckbox({ control });

    await userEvent.setup().click(screen.getByRole('checkbox'));

    expect(control.value).toBe(true);
  });

  it('shows the error message when the control is invalid and touched', async () => {
    const control = new FormControl<boolean>(false, { validators: Validators.requiredTrue, nonNullable: true });
    control.markAsTouched();

    await renderFormCheckbox({ control });

    expect(screen.getByTestId('form-checkbox-error')).not.toBeNull();
  });

  it('does not show error when the control is invalid but untouched', async () => {
    const control = new FormControl<boolean>(false, { validators: Validators.requiredTrue, nonNullable: true });
    await renderFormCheckbox({ control });

    expect(screen.queryByTestId('form-checkbox-error')).toBeNull();
  });

  it('displays a custom error message when config.errorMessages is set', async () => {
    const control = new FormControl<boolean>(false, { validators: Validators.requiredTrue, nonNullable: true });
    control.markAsTouched();

    await renderFormCheckbox({
      control,
      config: { errorMessages: { required: 'You must accept the terms' } },
    });

    expect(screen.getByTestId('form-checkbox-error').textContent?.trim()).toBe('You must accept the terms');
  });

  it('renders the checkbox as disabled when the FormControl is disabled', async () => {
    const control = new FormControl<boolean>({ value: false, disabled: true }, { nonNullable: true });
    await renderFormCheckbox({ control });

    expect((screen.getByRole('checkbox')).disabled).toBe(true);
  });

  it('renders the checkbox as required when Validators.requiredTrue is set', async () => {
    const control = new FormControl<boolean>(false, { validators: Validators.requiredTrue, nonNullable: true });
    await renderFormCheckbox({ control });

    expect((screen.getByRole('checkbox')).required).toBe(true);
  });

  it('renders the checkbox as required when Validators.required is set', async () => {
    const control = new FormControl<boolean>(false, { validators: Validators.required, nonNullable: true });
    await renderFormCheckbox({ control });

    expect((screen.getByRole('checkbox')).required).toBe(true);
  });

  it('marks the control as touched when the checkbox is toggled', async () => {
    const control = new FormControl<boolean>(false, { nonNullable: true });
    await renderFormCheckbox({ control });

    await userEvent.setup().click(screen.getByRole('checkbox'));

    expect(control.touched).toBe(true);
  });

  it('renders projected content inside the checkbox label', async () => {
    const control = new FormControl<boolean>(false, { nonNullable: true });

    const { fixture } = await render(
      `<app-form-checkbox [control]="control"><span data-testid="projected-content">Accept terms</span></app-form-checkbox>`,
      {
        imports: [AppFormCheckboxComponent],
        componentProperties: { control },
      }
    );
    fixture.detectChanges();

    expect(screen.getByTestId('projected-content')).not.toBeNull();
    expect(screen.getByTestId('projected-content').textContent).toBe('Accept terms');
  });
});
