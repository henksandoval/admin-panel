import { render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AppButtonComponent } from './app-button.component';
import { BUTTON_DEFAULTS } from './app-button.model';

async function renderButton(inputs: Record<string, unknown> = {}) {
  return render(AppButtonComponent, { componentInputs: inputs });
}

describe('AppButtonComponent', () => {
  it('renders with default type, color, and non-disabled state', async () => {
    await renderButton();

    const button = screen.getByRole('button');
    expect(button.getAttribute('type')).toBe(BUTTON_DEFAULTS.type);
    expect(button.getAttribute('color')).toBe(BUTTON_DEFAULTS.color);
    expect(button.disabled).toBe(false);
  });

  describe('buttonClasses', () => {
    it('renders without shape or size CSS classes when using default values', async () => {
      await renderButton();

      const button = screen.getByRole('button');
      expect(button.className).not.toContain('btn-shape-');
      expect(button.className).not.toContain('btn-size-');
    });

    it('applies shape and size CSS classes when they differ from defaults', async () => {
      await renderButton({ shape: 'square', size: 'small' });

      const button = screen.getByRole('button');
      expect(button.classList.contains('btn-shape-square')).toBe(true);
      expect(button.classList.contains('btn-size-small')).toBe(true);
    });
  });

  describe('icons', () => {
    it('renders no icons when iconBefore and iconAfter are not provided', async () => {
      const { container } = await renderButton();

      expect(container.querySelectorAll('mat-icon').length).toBe(0);
    });

    it('renders an icon before the content when iconBefore is provided', async () => {
      const { container } = await renderButton({ iconBefore: 'add' });

      const icons = container.querySelectorAll('mat-icon');
      expect(icons.length).toBe(1);
      expect(icons[0].textContent?.trim()).toBe('add');
    });

    it('renders an icon after the content when iconAfter is provided', async () => {
      const { container } = await renderButton({ iconAfter: 'arrow_forward' });

      const icons = container.querySelectorAll('mat-icon');
      expect(icons.length).toBe(1);
      expect(icons[0].textContent?.trim()).toBe('arrow_forward');
    });
  });

  describe('clicked output', () => {
    it('emits clicked when the button is clicked', async () => {
      const clickedSpy = vi.fn();
      const user = userEvent.setup();

      await render('<app-button (clicked)="handleClick($event)">Click</app-button>', {
        imports: [AppButtonComponent],
        componentProperties: { handleClick: clickedSpy },
      });

      await user.click(screen.getByRole('button'));
      expect(clickedSpy).toHaveBeenCalledOnce();
    });

    it('does not emit clicked when the button is disabled', async () => {
      const clickedSpy = vi.fn();
      const user = userEvent.setup({ pointerEventsCheck: 0 });

      await render('<app-button [disabled]="true" (clicked)="handleClick($event)">Click</app-button>', {
        imports: [AppButtonComponent],
        componentProperties: { handleClick: clickedSpy },
      });

      await user.click(screen.getByRole('button'));
      expect(clickedSpy).not.toHaveBeenCalled();
    });
  });
});
