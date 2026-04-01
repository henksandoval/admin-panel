import {
  computed,
  contentChild,
  Directive,
  effect,
  input,
  output,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { AppPageEvent, AppPaginationConfig, AppPaginationState, } from '@ui-atoms/app-pagination';
import { AppTableAction, AppTableConfig, AppTableSort } from '@ui-atoms/app-table';
import { AppFiltersConfig } from '@ui-molecules/app-filters';
import { AnyRecord, APP_TABLE_DEFAULTS } from './app-table.model';
import { calcLastPage } from './app-table.utils';

@Directive()
export abstract class AppTableBase<T extends AnyRecord> {
  readonly tableConfig = input.required<AppTableConfig<T>>();
  readonly filtersConfig = input<AppFiltersConfig>();
  readonly useAdvancedFilters = input<boolean>(APP_TABLE_DEFAULTS.useAdvancedFilters);
  readonly showPagination = input<boolean>(APP_TABLE_DEFAULTS.showPagination);
  readonly paginationConfig = input<AppPaginationConfig>();

  readonly loading = input(false);

  readonly resetPageOnFilter = input(APP_TABLE_DEFAULTS.resetPageOnFilter);
  readonly resetPageOnSort = input(APP_TABLE_DEFAULTS.resetPageOnSort);

  sortChange = output<AppTableSort>();
  pageChange = output<AppPageEvent>();
  rowClick = output<T>();
  actionClick = output<{ action: AppTableAction<T>; row: T }>();

  readonly projectedCellTemplate = contentChild<TemplateRef<unknown>>('cellTemplate');
  readonly currentSort = signal<AppTableSort>({ active: '', direction: '' });
  readonly pageIndex: WritableSignal<number> = signal(APP_TABLE_DEFAULTS.initialPageIndex);
  readonly pageSize: WritableSignal<number> = signal(APP_TABLE_DEFAULTS.initialPageSize);

  readonly paginationState = computed<AppPaginationState>(() => ({
    pageIndex: this.pageIndex(),
    pageSize: this.pageSize(),
    totalItems: this.totalItemCount(),
  }));
  private readonly boundaryGuard = effect(() => {
    if (this.skipBoundaryGuard()) return;
    const lastPage = calcLastPage(this.totalItemCount(), this.pageSize());
    if (this.pageIndex() > lastPage) this.pageIndex.set(lastPage);
  });

  onSortChange(sort: AppTableSort): void {
    this.currentSort.set(sort);

    if (this.resetPageOnSort()) {
      this.pageIndex.set(APP_TABLE_DEFAULTS.initialPageIndex);
    }

    this.sortChange.emit(sort);
  }

  onPageChange(event: AppPageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.pageChange.emit(event);
  }

  protected abstract totalItemCount(): number;

  protected abstract skipBoundaryGuard(): boolean;
}
