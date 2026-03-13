import { render, screen } from '@testing-library/angular';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { FormControl, Validators } from '@angular/forms';
import { AppFormSelectComponent } from './app-form-select.component';
import { SelectOption } from './app-form-select.model';

const COUNTRY_OPTIONS: SelectOption<string>[] = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
];

const GROUPED_OPTIONS: SelectOption<string>[] = [
  { value: 'us', label: 'United States', group: 'North America' },
  { value: 'ca', label: 'Canada', group: 'North America' },
  { value: 'mx', label: 'Mexico', group: 'North America' },
  { value: 'uk', label: 'United Kingdom', group: 'Europe' },
  { value: 'fr', label: 'France', group: 'Europe' },
  { value: 'de', label: 'Germany', group: 'Europe' },
];

async function renderSelect(
  control: FormControl<any>,
  options: SelectOption<any>[],
  config: Record<string, any> = {},
) {
  const { fixture, container } = await render(AppFormSelectComponent, {
    componentInputs: { control, options, config },
  });
  return { fixture, container };
}

async function openPanel(fixture: { detectChanges: () => void }) {
  const user = userEvent.setup();
  await user.click(screen.getByRole('combobox'));
  fixture.detectChanges();
}

describe('AppFormSelectComponent', () => {
  it('marks the initially selected option as selected when the panel is opened', async () => {
    const control = new FormControl('us');
    const { fixture } = await renderSelect(control, COUNTRY_OPTIONS);

    await openPanel(fixture);

    const selectedOptions = [...document.querySelectorAll('mat-option[aria-selected="true"]')];
    expect(selectedOptions.length).toBe(1);
    expect(selectedOptions[0].textContent?.trim()).toBe('United States');
  });

  it('reflects a programmatic FormControl value change in the select trigger', async () => {
    const control = new FormControl<string | null>(null);
    const { fixture } = await renderSelect(control, COUNTRY_OPTIONS);

    control.setValue('uk');
    fixture.detectChanges();

    expect(screen.getByRole('combobox').textContent).toContain('United Kingdom');
  });

  it('shows the error when the control is invalid and has been touched', async () => {
    const control = new FormControl<string | null>(null, Validators.required);
    const { fixture } = await renderSelect(control, COUNTRY_OPTIONS);

    control.markAsTouched();
    fixture.detectChanges();

    expect(screen.queryByTestId('form-select-error')).toBeTruthy();
    expect(screen.getByTestId('form-select-error').textContent?.trim()).toBe('This field is required');
  });

  it('does not show an error when the control is invalid but untouched', async () => {
    const control = new FormControl<string | null>(null, Validators.required);
    await renderSelect(control, COUNTRY_OPTIONS);

    expect(screen.queryByTestId('form-select-error')).toBeNull();
  });

  it('displays a custom error message when errorMessages config overrides the default', async () => {
    const control = new FormControl<string | null>(null, Validators.required);
    control.markAsTouched();
    await renderSelect(control, COUNTRY_OPTIONS, {
      errorMessages: { required: 'Please select a country' },
    });

    expect(screen.getByTestId('form-select-error').textContent?.trim()).toBe('Please select a country');
  });

  it('disables the select when the FormControl is disabled', async () => {
    const control = new FormControl({ value: null, disabled: true });
    await renderSelect(control, COUNTRY_OPTIONS);

    expect(screen.getByRole('combobox').getAttribute('aria-disabled')).toBe('true');
  });

  it('marks the select as required when the FormControl has Validators.required', async () => {
    const control = new FormControl<string | null>(null, Validators.required);
    await renderSelect(control, COUNTRY_OPTIONS);

    expect(screen.getByRole('combobox').getAttribute('aria-required')).toBe('true');
  });

  it('renders all provided options when the panel is opened', async () => {
    const control = new FormControl<string | null>(null);
    const { fixture } = await renderSelect(control, COUNTRY_OPTIONS);

    await openPanel(fixture);

    expect(document.querySelectorAll('mat-option').length).toBe(3);
  });

  it('renders option groups when options have a group property', async () => {
    const control = new FormControl<string | null>(null);
    const { fixture } = await renderSelect(control, GROUPED_OPTIONS);

    await openPanel(fixture);

    expect(document.querySelectorAll('mat-optgroup').length).toBe(2);
  });

  it('does not render option groups when no group property is present', async () => {
    const control = new FormControl<string | null>(null);
    const { fixture } = await renderSelect(control, COUNTRY_OPTIONS);

    await openPanel(fixture);

    expect(document.querySelectorAll('mat-optgroup').length).toBe(0);
  });

  it('shows the listbox as multi-selectable when multiple config is true', async () => {
    const control = new FormControl<string[]>(['us', 'uk']);
    const { fixture } = await renderSelect(control, COUNTRY_OPTIONS, { multiple: true });

    await openPanel(fixture);

    const listbox = document.querySelector('[role="listbox"]');
    expect(listbox?.getAttribute('aria-multiselectable')).toBe('true');
  });

  it('disables only the options marked with disabled: true', async () => {
    const optionsWithDisabled: SelectOption<string>[] = [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom', disabled: true },
      { value: 'ca', label: 'Canada' },
    ];
    const control = new FormControl<string | null>(null);
    const { fixture } = await renderSelect(control, optionsWithDisabled);

    await openPanel(fixture);

    const options = document.querySelectorAll('mat-option');
    expect(options[0].getAttribute('aria-disabled')).toBe('false');
    expect(options[1].getAttribute('aria-disabled')).toBe('true');
    expect(options[2].getAttribute('aria-disabled')).toBe('false');
  });

  it('applies the density CSS class to the host element', async () => {
    const control = new FormControl<string | null>(null);
    const { container } = await renderSelect(control, COUNTRY_OPTIONS, { density: -2 });

    expect(container.classList.contains('app-form-select--density-n2')).toBe(true);
  });

  it('renders the label when provided in config', async () => {
    const control = new FormControl<string | null>(null);
    await renderSelect(control, COUNTRY_OPTIONS, { label: 'Country' });

    expect(screen.getByTestId('form-select-label').textContent?.trim()).toBe('Country');
  });

  it('renders the hint when provided in config', async () => {
    const control = new FormControl<string | null>(null);
    await renderSelect(control, COUNTRY_OPTIONS, { hint: 'Select your country of residence' });

    expect(screen.getByTestId('form-select-hint').textContent?.trim()).toBe('Select your country of residence');
  });

  it('renders the icon when provided in config', async () => {
    const control = new FormControl<string | null>(null);
    await renderSelect(control, COUNTRY_OPTIONS, { icon: 'public' });

    expect(screen.getByTestId('form-select-icon').textContent?.trim()).toBe('public');
  });

  it('updates the FormControl value when an option is selected via click', async () => {
    const control = new FormControl<string | null>(null);
    const { fixture } = await renderSelect(control, COUNTRY_OPTIONS);
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox'));
    fixture.detectChanges();

    const ukOption = [...document.querySelectorAll('mat-option')].find(
      (o) => o.textContent?.includes('United Kingdom'),
    );
    if (ukOption) {
      await user.click(ukOption as HTMLElement);
      fixture.detectChanges();
    }

    expect(control.value).toBe('uk');
  });
});

