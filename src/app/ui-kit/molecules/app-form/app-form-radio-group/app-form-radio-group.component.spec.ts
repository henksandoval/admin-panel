import { FormControl, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { AppFormRadioGroupComponent } from './app-form-radio-group.component';
import { AppFormRadioGroupOptions, RadioOption } from './app-form-radio-group.model';

const OPTIONS: RadioOption<string>[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

async function renderComponent(
  control: FormControl,
  options: RadioOption<any>[] = OPTIONS,
  config?: AppFormRadioGroupOptions,
) {
  const { fixture } = await render(AppFormRadioGroupComponent, {
    componentInputs: {
      control,
      options,
      ...(config !== undefined ? { config } : {}),
    },
  });
  return { fixture };
}

describe('AppFormRadioGroupComponent', () => {
  it('renders with the initial FormControl value selected', async () => {
    await renderComponent(new FormControl('female'));

    expect((screen.getByRole('radio', { name: 'Female' }) as HTMLInputElement).checked).toBe(true);
  });

  it('updates the FormControl when a radio option is selected', async () => {
    const control = new FormControl<string | null>(null);
    await renderComponent(control);

    await userEvent.setup().click(screen.getByRole('radio', { name: 'Female' }));

    expect(control.value).toBe('female');
  });

  it('shows the error message when the control is invalid and touched', async () => {
    const control = new FormControl(null, Validators.required);
    const { fixture } = await renderComponent(control);

    control.markAsTouched();
    fixture.detectChanges();

    const errorEl = screen.getByTestId('radio-group-error');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent?.trim()).toBe('This field is required');
  });

  it('does not show error when the control is invalid but untouched', async () => {
    await renderComponent(new FormControl(null, Validators.required));

    expect(screen.queryByTestId('radio-group-error')).toBeNull();
  });

  it('shows a custom error message from config when control is invalid and touched', async () => {
    const control = new FormControl(null, Validators.required);
    const { fixture } = await renderComponent(control, OPTIONS, {
      errorMessages: { required: 'Please select a gender' },
    });

    control.markAsTouched();
    fixture.detectChanges();

    expect(screen.getByTestId('radio-group-error').textContent?.trim()).toBe('Please select a gender');
  });

  it('disables all radio options when the FormControl is disabled', async () => {
    await renderComponent(new FormControl({ value: null, disabled: true }));

    screen.getAllByRole('radio').forEach(radio => {
      expect((radio as HTMLInputElement).disabled).toBe(true);
    });
  });

  it('displays the required indicator when Validators.required is applied', async () => {
    await renderComponent(new FormControl(null, Validators.required), OPTIONS, { label: 'Gender' });

    const indicator = screen.getByTestId('radio-group-required-indicator');
    expect(indicator).not.toBeNull();
    expect(indicator.textContent?.trim()).toBe('*');
  });

  it('renders all provided radio options', async () => {
    await renderComponent(new FormControl(null));

    expect(screen.getAllByRole('radio')).toHaveLength(OPTIONS.length);
  });

  it('does not apply horizontal layout class by default', async () => {
    await renderComponent(new FormControl(null));

    expect(screen.getByTestId('radio-group').classList.contains('app-form-radio-group-layout-horizontal')).toBe(false);
  });

  it('applies horizontal layout class when configured', async () => {
    await renderComponent(new FormControl(null), OPTIONS, { layout: 'horizontal' });

    expect(screen.getByTestId('radio-group').classList.contains('app-form-radio-group-layout-horizontal')).toBe(true);
  });

  it('disables only the options marked as disabled in the options array', async () => {
    const optionsWithDisabled: RadioOption<string>[] = [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female', disabled: true },
      { value: 'other', label: 'Other' },
    ];
    await renderComponent(new FormControl(null), optionsWithDisabled);

    expect((screen.getByRole('radio', { name: 'Male' }) as HTMLInputElement).disabled).toBe(false);
    expect((screen.getByRole('radio', { name: 'Female' }) as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole('radio', { name: 'Other' }) as HTMLInputElement).disabled).toBe(false);
  });
});

