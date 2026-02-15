import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  WritableSignal,
  ChangeDetectionStrategy,
  contentChild,
  TemplateRef,
} from '@angular/core';
import { AppTableComponent } from '@shared/atoms/app-table/app-table.component';
import {
  AppTableConfig,
  AppTableSort,
  AppTableAction,
} from '@shared/atoms/app-table/app-table.model';
import { AppPaginationComponent } from '@shared/atoms/app-pagination/app-pagination.component';
import {
  AppPaginationConfig,
  AppPaginationState,
  AppPageEvent,
} from '@shared/atoms/app-pagination/app-pagination.model';
import { AppTableServerParams, TABLE_SERVER_SIDE_DEFAULTS } from './app-table-server-side.model';
import { AppSimpleFiltersConfig, AppSimpleFilterValues } from '@shared/molecules/app-filters/app-filter.model';
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
export class AppTableServerSideComponent<T extends Record<string, any> = Record<string, any>> {
  // Required inputs
  tableConfig = input.required<AppTableConfig<T>>();

  // Data inputs
  data = input<T[]>([]);
  totalItems = input<number>(0);
  loading = input(false);

  // Configuration inputs
  filtersConfig = input<AppSimpleFiltersConfig>();
  paginationConfig = input<AppPaginationConfig>();

  // Behavior inputs
  resetPageOnFilter = input(TABLE_SERVER_SIDE_DEFAULTS.resetPageOnFilter);
  resetPageOnSort = input(TABLE_SERVER_SIDE_DEFAULTS.resetPageOnSort);

  // Outputs
  filterChange = output<AppSimpleFilterValues>();
  sortChange = output<AppTableSort>();
  pageChange = output<AppPageEvent>();
  paramsChange = output<AppTableServerParams>();
  rowClick = output<T>();
  actionClick = output<{ action: AppTableAction<T>; row: T }>();

  // Content projection
  readonly projectedCellTemplate = contentChild<TemplateRef<any>>('cellTemplate');

  // Internal state
  readonly currentSort = signal<AppTableSort>({ active: '', direction: '' });
  readonly filterValues = signal<AppSimpleFilterValues>({});
  readonly pageIndex: WritableSignal<number> = signal(TABLE_SERVER_SIDE_DEFAULTS.initialPageIndex);
  readonly pageSize: WritableSignal<number> = signal(TABLE_SERVER_SIDE_DEFAULTS.initialPageSize);

  // Computed state
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

  /**
   * Boundary guard: Previene que pageIndex esté fuera de rango
   * cuando totalItems cambia (ej: después de filtrar en servidor).
   */
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

  onFiltersChange(values: AppSimpleFilterValues): void {
    this.filterValues.set(values);

    if (this.resetPageOnFilter()) {
      this.pageIndex.set(TABLE_SERVER_SIDE_DEFAULTS.initialPageIndex);
    }

    this.filterChange.emit(values);
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




