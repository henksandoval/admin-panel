/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  input,
  output,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { AppTableComponent } from '@shared/atoms/app-table/app-table.component';
import { AppTableAction, AppTableConfig, AppTableSort, } from '@shared/atoms/app-table/app-table.model';
import { AppPaginationComponent } from '@shared/atoms/app-pagination/app-pagination.component';
import {
  AppPageEvent,
  AppPaginationConfig,
  AppPaginationState,
} from '@shared/atoms/app-pagination/app-pagination.model';
import { AppTableServerParams, TABLE_SERVER_SIDE_DEFAULTS } from './app-table-server-side.model';
import { AppFiltersConfig, AppFilterValues, AppFilterCriterion } from '@shared/molecules/app-filters/app-filter.model';
import { AppSimpleFilterComponent } from '@shared/molecules/app-filters/simple/app-simple-filter.component';

@Component({
  selector: 'app-table-server-side',
  standalone: true,
  imports: [
    AppTableComponent,
    AppSimpleFilterComponent,
    AppPaginationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app-table-server-side.component.scss',
  templateUrl: './app-table-server-side.component.html',
})
export class AppTableServerSideComponent<T extends Record<string, any>> {
  readonly tableConfig = input.required<AppTableConfig<T>>();

  readonly data = input<T[]>([]);
  readonly totalItems = input<number>(0);
  readonly loading = input(false);

  readonly filtersConfig = input<AppFiltersConfig>();
  readonly paginationConfig = input<AppPaginationConfig>();
  readonly showPagination = input(TABLE_SERVER_SIDE_DEFAULTS.showPagination);

  readonly resetPageOnFilter = input(TABLE_SERVER_SIDE_DEFAULTS.resetPageOnFilter);
  readonly resetPageOnSort = input(TABLE_SERVER_SIDE_DEFAULTS.resetPageOnSort);

  filtersChange = output<AppFilterValues>();
  sortChange = output<AppTableSort>();
  pageChange = output<AppPageEvent>();
  paramsChange = output<AppTableServerParams>();
  rowClick = output<T>();
  actionClick = output<{ action: AppTableAction<T>; row: T }>();

  readonly projectedCellTemplate = contentChild<TemplateRef<unknown>>('cellTemplate');

  readonly currentSort = signal<AppTableSort>({ active: '', direction: '' });
  readonly filterValues = signal<AppFilterValues>({});
  readonly pageIndex: WritableSignal<number> = signal(TABLE_SERVER_SIDE_DEFAULTS.initialPageIndex);
  readonly pageSize: WritableSignal<number> = signal(TABLE_SERVER_SIDE_DEFAULTS.initialPageSize);

  readonly paginationState = computed<AppPaginationState>(() => ({
    pageIndex: this.pageIndex(),
    pageSize: this.pageSize(),
    totalItems: this.totalItems(),
  }));

  readonly safeFiltersConfig = computed(() => this.filtersConfig());
  readonly safePaginationConfig = computed(() => this.paginationConfig());

  readonly currentParams = computed<AppTableServerParams>(() => ({
    filters: this.filterValues(),
    sort: this.currentSort(),
    pageIndex: this.pageIndex(),
    pageSize: this.pageSize(),
  }));

  private readonly boundaryGuard = effect(() => {
    const total = this.totalItems();
    const pageSize = this.pageSize();
    const currentPage = this.pageIndex();

    if (total === 0) return;

    const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1);

    if (currentPage > lastPage) {
      this.pageIndex.set(lastPage);
    }
  });

  onFiltersChange(criteria: AppFilterCriterion[]): void {
    const values = this.criteriaToValues(criteria);
    this.filterValues.set(values);

    if (this.resetPageOnFilter()) {
      this.pageIndex.set(TABLE_SERVER_SIDE_DEFAULTS.initialPageIndex);
    }

    this.filtersChange.emit(values);
    this.emitParamsChange();
  }

  onSortChange(sort: AppTableSort): void {
    this.currentSort.set(sort);

    if (this.resetPageOnSort()) {
      this.pageIndex.set(TABLE_SERVER_SIDE_DEFAULTS.initialPageIndex);
    }

    this.sortChange.emit(sort);
    this.emitParamsChange();
  }

  onPageChange(event: AppPageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);

    this.pageChange.emit(event);
    this.emitParamsChange();
  }

  private emitParamsChange(): void {
    this.paramsChange.emit(this.currentParams());
  }

  private criteriaToValues(criteria: AppFilterCriterion[]): AppFilterValues {
    return criteria.reduce((acc, criterion) => {
      acc[criterion.field.key] = criterion.value;
      return acc;
    }, {} as AppFilterValues);
  }
}




