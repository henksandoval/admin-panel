import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { AppToggleGroupComponent } from './app-toggle-group.component';
import { TOGGLE_GROUP_DEFAULTS, ToggleOption } from './app-toggle-group.model';

const OPTIONS: ToggleOption[] = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

async function renderToggleGroup(inputs: Record<string, unknown> = {}) {
  const { fixture } = await render(AppToggleGroupComponent, {
    componentInputs: { options: OPTIONS, ...inputs },
  });
  return { fixture };
}

describe('AppToggleGroupComponent', () => {
  it('renders with default color attribute and no disabled state', async () => {
    await renderToggleGroup();
    const group = screen.getByTestId('toggle-group');
    expect(group.getAttribute('color')).toBe(TOGGLE_GROUP_DEFAULTS.color);
    expect(group.getAttribute('disabled')).toBeNull();
  });

  describe('CSS classes', () => {
    it('renders without extra size or appearance classes when using defaults', async () => {
      await renderToggleGroup();
      const group = screen.getByTestId('toggle-group');
      expect(group.className).not.toContain('toggle-size-');
      expect(group.className).not.toContain('toggle-appearance-');
    });

    it('applies size and appearance CSS classes when set to non-default values', async () => {
      const { fixture } = await renderToggleGroup();
      fixture.componentRef.setInput('size', 'small');
      fixture.componentRef.setInput('appearance', 'legacy');
      fixture.detectChanges();
      const group = screen.getByTestId('toggle-group');
      expect(group.classList.contains('toggle-size-small')).toBe(true);
      expect(group.classList.contains('toggle-appearance-legacy')).toBe(true);
    });
  });

  it('renders all provided options with data-testid attributes', async () => {
    await renderToggleGroup();
    OPTIONS.forEach(option => {
      expect(screen.queryByTestId(`toggle-option-${option.value}`)).not.toBeNull();
    });
  });

  it('emits changed event with the selected option value when a toggle button is clicked', async () => {
    const changedSpy = vi.fn();
    const { fixture } = await render(
      `<app-toggle-group [options]="options" (changed)="onChanged($event)"></app-toggle-group>`,
      {
        imports: [AppToggleGroupComponent],
        componentProperties: {
          options: OPTIONS,
          onChanged: changedSpy,
        },
      }
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('radio', { name: 'Option A' }));
    fixture.detectChanges();
    expect(changedSpy).toHaveBeenCalledWith('a');
  });

  it('marks the corresponding toggle as selected when value is set', async () => {
    const { fixture } = await renderToggleGroup();
    fixture.componentRef.setInput('value', 'b');
    fixture.detectChanges();
    const toggleB = screen.getByTestId('toggle-option-b');
    expect(toggleB.classList.contains('mat-button-toggle-checked')).toBe(true);
  });
});
