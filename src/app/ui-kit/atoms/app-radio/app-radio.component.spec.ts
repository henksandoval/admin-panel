import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { AppRadioComponent } from './app-radio.component';

async function renderRadioComponent(inputs: { value: unknown; disabled?: boolean; ariaLabel?: string }) {
  return render(AppRadioComponent, {
    componentInputs: {
      value: inputs.value,
      disabled: inputs.disabled ?? false,
      ariaLabel: inputs.ariaLabel ?? '',
    },
  });
}

describe('AppRadioComponent', () => {
  it('renders a mat-radio-button element in the DOM', async () => {
    await renderRadioComponent({ value: 'option1' });

    expect(screen.getByTestId('radio-button')).toBeTruthy();
  });

  it('renders the radio button as enabled and without aria-label by default', async () => {
    await renderRadioComponent({ value: 'option1' });

    expect((screen.getByRole('radio') as HTMLInputElement).disabled).toBe(false);
    expect(screen.getByTestId('radio-button').getAttribute('aria-label')).toBeNull();
  });

  it('disables the radio button when disabled input is true', async () => {
    await renderRadioComponent({ value: 'option1', disabled: true });

    expect((screen.getByRole('radio') as HTMLInputElement).disabled).toBe(true);
  });
});
