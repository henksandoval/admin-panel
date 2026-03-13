import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { AppFilterFooterComponent } from './app-filter-footer.component';
import { AppFilterToggle } from '../app-filter.model';
import { AppButtonStubComponent } from '@stubs/ui-kit/app-button.stub';
import { AppCheckboxStubComponent } from '@stubs/ui-kit/app-checkbox.stub';
import { MatDividerStubComponent } from '@stubs/material/mat-divider.stub';

const TOGGLES: AppFilterToggle[] = [
  { key: 'active', label: 'Active', value: true },
  { key: 'archived', label: 'Archived', value: false },
];

async function renderFilterFooter(options: {
  toggles?: AppFilterToggle[];
  showClearButton?: boolean;
  showSearchButton?: boolean;
  onToggleChange?: ReturnType<typeof vi.fn>;
  onClearClick?: ReturnType<typeof vi.fn>;
  onSearchClick?: ReturnType<typeof vi.fn>;
} = {}) {
  const toggleChangeSpy = options.onToggleChange ?? vi.fn();
  const clearClickSpy = options.onClearClick ?? vi.fn();
  const searchClickSpy = options.onSearchClick ?? vi.fn();

  await render(AppFilterFooterComponent, {
    componentInputs: {
      toggles: options.toggles ?? [],
      showClearButton: options.showClearButton ?? true,
      showSearchButton: options.showSearchButton ?? true,
    },
    componentImports: [AppButtonStubComponent, AppCheckboxStubComponent, MatDividerStubComponent],
    on: {
      toggleChange: toggleChangeSpy,
      clearClick: clearClickSpy,
      searchClick: searchClickSpy,
    },
  });

  return { toggleChangeSpy, clearClickSpy, searchClickSpy };
}

describe('AppFilterFooterComponent', () => {
  describe('footer visibility', () => {
    it('renders the footer by default because showClearButton and showSearchButton default to true', async () => {
      await renderFilterFooter();

      expect(screen.getByTestId('filter-footer')).toBeTruthy();
    });

    it('does not render the footer when all visibility options are off and no toggles are provided', async () => {
      await renderFilterFooter({ showClearButton: false, showSearchButton: false, toggles: [] });

      expect(screen.queryByTestId('filter-footer')).toBeNull();
    });

    it('renders the footer when buttons are hidden but toggles are present', async () => {
      await renderFilterFooter({ showClearButton: false, showSearchButton: false, toggles: TOGGLES });

      expect(screen.getByTestId('filter-footer')).toBeTruthy();
    });
  });

  describe('toggle interaction', () => {
    it('emits the full toggles record with the updated value after a toggle is clicked', async () => {
      const { toggleChangeSpy } = await renderFilterFooter({ toggles: TOGGLES });
      const user = userEvent.setup();

      await user.click(screen.getByTestId('filter-footer-toggle-active').querySelector('button')!);

      expect(toggleChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({ active: false, archived: false }),
      );
    });
  });

  describe('button actions', () => {
    it('emits clearClick when the clear button is clicked', async () => {
      const { clearClickSpy } = await renderFilterFooter();
      const user = userEvent.setup();

      await user.click(screen.getByTestId('filter-footer-clear-button'));

      expect(clearClickSpy).toHaveBeenCalledOnce();
    });

    it('emits searchClick when the search button is clicked', async () => {
      const { searchClickSpy } = await renderFilterFooter();
      const user = userEvent.setup();

      await user.click(screen.getByTestId('filter-footer-search-button'));

      expect(searchClickSpy).toHaveBeenCalledOnce();
    });
  });
});

