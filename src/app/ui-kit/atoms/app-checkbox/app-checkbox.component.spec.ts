import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { AppCheckboxComponent } from './app-checkbox.component';
import { CheckboxSize } from './app-checkbox.model';

async function renderCheckbox(options: {
  size?: CheckboxSize;
  disabled?: boolean;
  changedSpy?: ReturnType<typeof vi.fn>;
} = {}) {
  const changedSpy = options.changedSpy ?? vi.fn();

  await render(
    `<app-checkbox
      [size]="size"
      [disabled]="disabled"
      (changed)="changedSpy($event)">
    </app-checkbox>`,
    {
      imports: [AppCheckboxComponent],
      componentProperties: {
        size: options.size ?? 'medium',
        disabled: options.disabled ?? false,
        changedSpy,
      },
    }
  );

  return { changedSpy };
}

describe('AppCheckboxComponent', () => {
  it('renders unchecked, enabled, and non-required by default', async () => {
    await renderCheckbox();

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.checked).toBe(false);
    expect(checkbox.disabled).toBe(false);
    expect(checkbox.required).toBe(false);
  });

  describe('size classes', () => {
    it('applies no size class when size is medium', async () => {
      await renderCheckbox({ size: 'medium' });

      const checkboxHost = screen.getByTestId('app-checkbox');
      expect(checkboxHost.classList.contains('checkbox-size-small')).toBe(false);
      expect(checkboxHost.classList.contains('checkbox-size-large')).toBe(false);
    });

    it('applies checkbox-size-small class when size is small', async () => {
      await renderCheckbox({ size: 'small' });

      expect(screen.getByTestId('app-checkbox').classList.contains('checkbox-size-small')).toBe(true);
    });

    it('applies checkbox-size-large class when size is large', async () => {
      await renderCheckbox({ size: 'large' });

      expect(screen.getByTestId('app-checkbox').classList.contains('checkbox-size-large')).toBe(true);
    });
  });

  it('becomes checked and emits changed with true when clicked', async () => {
    const changedSpy = vi.fn();
    await renderCheckbox({ changedSpy });

    await userEvent.setup().click(screen.getByRole('checkbox'));

    expect((screen.getByRole('checkbox')).checked).toBe(true);
    expect(changedSpy).toHaveBeenCalledWith(true);
  });

  it('does not emit changed when a disabled checkbox is clicked', async () => {
    const changedSpy = vi.fn();
    await renderCheckbox({ disabled: true, changedSpy });

    fireEvent.click(screen.getByRole('checkbox'));

    expect(changedSpy).not.toHaveBeenCalled();
  });
});
