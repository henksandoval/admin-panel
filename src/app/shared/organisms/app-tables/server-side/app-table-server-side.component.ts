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
import { AppCardComponent } from '@shared/atoms/app-card/app-card.component';
import { AppPaginationComponent } from '@shared/atoms/app-pagination/app-pagination.component';
import {
  AppPageEvent,
  AppPaginationConfig,
  AppPaginationState,
} from '@shared/atoms/app-pagination/app-pagination.model';
import { AppTableComponent } from '@shared/atoms/app-table/app-table.component';
import { AppTableAction, AppTableConfig, AppTableSort } from '@shared/atoms/app-table/app-table.model';
import { AppAdvancedFilterComponent } from '@shared/molecules/app-filters/advanced/app-advanced-filter.component';
import { AppFilterCriterion, AppFiltersConfig, AppFilterValues } from '@shared/molecules/app-filters/app-filter.model';
import { criteriaToValues } from '@shared/molecules/app-filters/criteria-evaluator.utils';
import { AppSimpleFilterComponent } from '@shared/molecules/app-filters/simple/app-simple-filter.component';
import { AppTableServerParams, TABLE_SERVER_SIDE_DEFAULTS } from './app-table-server-side.model';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

@Component({
  selector: 'app-table-server-side',
  standalone: true,
  imports: [
    AppTableComponent,
    AppSimpleFilterComponent,
    AppAdvancedFilterComponent,
    AppPaginationComponent,
    AppCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app-table-server-side.component.scss',
  templateUrl: './app-table-server-side.component.html',
})
export class AppTableServerSideComponent<T extends AnyRecord> {
  // --- Inputs ---
  readonly tableConfig = input.required<AppTableConfig<T>>();
  readonly filtersConfig = input<AppFiltersConfig>();
  readonly useAdvancedFilters = input<boolean>(TABLE_SERVER_SIDE_DEFAULTS.useAdvancedFilters);
  readonly showPagination = input<boolean>(TABLE_SERVER_SIDE_DEFAULTS.showPagination);
  readonly paginationConfig = input<AppPaginationConfig>();

  readonly displayData = input<T[]>([]);
  readonly loading = input(false);
  readonly totalItems = input<number>(0);

  readonly resetPageOnFilter = input(TABLE_SERVER_SIDE_DEFAULTS.resetPageOnFilter);
  readonly resetPageOnSort = input(TABLE_SERVER_SIDE_DEFAULTS.resetPageOnSort);

  // --- Outputs ---
  filtersChange = output<AppFilterValues>();
  sortChange = output<AppTableSort>();
  pageChange = output<AppPageEvent>();
  paramsChange = output<AppTableServerParams>();
  rowClick = output<T>();
  actionClick = output<{ action: AppTableAction<T>; row: T }>();

  // --- State ---
  readonly projectedCellTemplate = contentChild<TemplateRef<unknown>>('cellTemplate');
  readonly currentSort = signal<AppTableSort>({ active: '', direction: '' });
  readonly filterValues = signal<AppFilterValues>({});
  readonly pageIndex: WritableSignal<number> = signal(TABLE_SERVER_SIDE_DEFAULTS.initialPageIndex);
  readonly pageSize: WritableSignal<number> = signal(TABLE_SERVER_SIDE_DEFAULTS.initialPageSize);

  // --- Derived state ---
  readonly paginationState = computed<AppPaginationState>(() => ({
    pageIndex: this.pageIndex(),
    pageSize: this.pageSize(),
    totalItems: this.totalItems(),
  }));

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
    const values = criteriaToValues(criteria);
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
}

