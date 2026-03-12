import { ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppPaginationComponent } from './app-pagination.component';
import { AppPageEvent, AppPaginationConfig, AppPaginationState, PAGINATION_DEFAULTS } from './app-pagination.model';
import { AppButtonStubComponent } from '@stubs/ui-kit/app-button.stub';
import { AppFormSelectStubComponent } from '@stubs/ui-kit/app-form-select.stub';
import { MatTooltipStubDirective } from '@stubs/material/mat-tooltip.stub';

async function renderPaginationComponent(
  state: AppPaginationState = { pageIndex: 0, pageSize: 10, totalItems: 100 },
  config: AppPaginationConfig = {},
) {
  const pageChangeMock = vi.fn<(event: AppPageEvent) => void>();

  await render(AppPaginationComponent, {
    componentInputs: { state, config },
    componentImports: [ReactiveFormsModule, AppButtonStubComponent, AppFormSelectStubComponent, MatTooltipStubDirective],
    on: { pageChange: pageChangeMock },
  });

  return { pageChangeMock };
}

describe('AppPaginationComponent', () => {
  describe('range label', () => {
    it('displays zero range when total items is zero', async () => {
      await renderPaginationComponent({ pageIndex: 0, pageSize: 10, totalItems: 0 });

      const rangeInfo = screen.getByTestId('pagination-range-info');
      expect(rangeInfo.textContent?.trim()).toBe(`0 ${PAGINATION_DEFAULTS.ofLabel} 0`);
    });

    it('calculates the correct range for a middle page', async () => {
      await renderPaginationComponent({ pageIndex: 2, pageSize: 10, totalItems: 100 });

      const rangeInfo = screen.getByTestId('pagination-range-info');
      expect(rangeInfo.textContent?.trim()).toBe(`21 - 30 ${PAGINATION_DEFAULTS.ofLabel} 100`);
    });

    it('clamps end index to totalItems on the last page', async () => {
      await renderPaginationComponent({ pageIndex: 9, pageSize: 10, totalItems: 95 });

      const rangeInfo = screen.getByTestId('pagination-range-info');
      expect(rangeInfo.textContent?.trim()).toBe(`91 - 95 ${PAGINATION_DEFAULTS.ofLabel} 95`);
    });
  });

  describe('navigation buttons disabled state', () => {
    it('disables first and previous buttons when on the first page', async () => {
      await renderPaginationComponent({ pageIndex: 0, pageSize: 10, totalItems: 100 });

      expect(screen.getByTestId<HTMLButtonElement>('pagination-first-page-button').disabled).toBe(true);
      expect(screen.getByTestId<HTMLButtonElement>('pagination-prev-button').disabled).toBe(true);
      expect(screen.getByTestId<HTMLButtonElement>('pagination-next-button').disabled).toBe(false);
      expect(screen.getByTestId<HTMLButtonElement>('pagination-last-page-button').disabled).toBe(false);
    });

    it('disables next and last buttons when on the last page', async () => {
      await renderPaginationComponent({ pageIndex: 9, pageSize: 10, totalItems: 100 });

      expect(screen.getByTestId<HTMLButtonElement>('pagination-first-page-button').disabled).toBe(false);
      expect(screen.getByTestId<HTMLButtonElement>('pagination-prev-button').disabled).toBe(false);
      expect(screen.getByTestId<HTMLButtonElement>('pagination-next-button').disabled).toBe(true);
      expect(screen.getByTestId<HTMLButtonElement>('pagination-last-page-button').disabled).toBe(true);
    });
  });

  describe('page navigation', () => {
    it('emits pageChange with incremented index when the next button is clicked', async () => {
      const { pageChangeMock } = await renderPaginationComponent({ pageIndex: 0, pageSize: 10, totalItems: 100 });
      const user = userEvent.setup();

      await user.click(screen.getByTestId('pagination-next-button'));

      expect(pageChangeMock).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 10, previousPageIndex: 0 });
    });

    it('emits pageChange with decremented index when the previous button is clicked', async () => {
      const { pageChangeMock } = await renderPaginationComponent({ pageIndex: 2, pageSize: 10, totalItems: 100 });
      const user = userEvent.setup();

      await user.click(screen.getByTestId('pagination-prev-button'));

      expect(pageChangeMock).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 10, previousPageIndex: 2 });
    });

    it('does not emit when clicking disabled buttons on the first page', async () => {
      const { pageChangeMock } = await renderPaginationComponent({ pageIndex: 0, pageSize: 10, totalItems: 100 });
      const user = userEvent.setup();

      await user.click(screen.getByTestId('pagination-first-page-button'));
      await user.click(screen.getByTestId('pagination-prev-button'));

      expect(pageChangeMock).not.toHaveBeenCalled();
    });

    it('does not emit when clicking disabled buttons on the last page', async () => {
      const { pageChangeMock } = await renderPaginationComponent({ pageIndex: 9, pageSize: 10, totalItems: 100 });
      const user = userEvent.setup();

      await user.click(screen.getByTestId('pagination-next-button'));
      await user.click(screen.getByTestId('pagination-last-page-button'));

      expect(pageChangeMock).not.toHaveBeenCalled();
    });
  });

  describe('page size change', () => {
    it('recalculates page index to keep the first visible item stable after size change', async () => {
      const { pageChangeMock } = await renderPaginationComponent({ pageIndex: 2, pageSize: 10, totalItems: 100 });
      const user = userEvent.setup();

      await user.selectOptions(screen.getByRole('combobox'), ['25']);

      expect(pageChangeMock).toHaveBeenCalledWith({ pageIndex: 0, pageSize: 25, previousPageIndex: 2 });
    });
  });
});
