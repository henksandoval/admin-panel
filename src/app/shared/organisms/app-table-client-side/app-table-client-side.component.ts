import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  input,
  output,
  signal,
  TemplateRef
} from "@angular/core";
import { AppCardComponent } from "@shared/atoms/app-card/app-card.component";
import { AppPaginationComponent } from "@shared/atoms/app-pagination/app-pagination.component";
import {
  AppPageEvent,
  AppPaginationConfig,
  AppPaginationState
} from "@shared/atoms/app-pagination/app-pagination.model";
import { AppTableComponent } from "@shared/atoms/app-table/app-table.component";
import { AppTableAction, AppTableConfig, AppTableSort } from "@shared/atoms/app-table/app-table.model";
import { AppAdvancedFilterComponent } from "@shared/molecules/app-filters/advanced/app-advanced-filter.component";
import { AppFilterCriterion, AppFiltersConfig } from "@shared/molecules/app-filters/app-filter.model";
import { evaluateCriteria } from "@shared/molecules/app-filters/criteria-evaluator.utils";
import { AppSimpleFilterComponent } from "@shared/molecules/app-filters/simple/app-simple-filter.component";
import { AppTableFilterFn, AppTableSortFn } from "./app-table-client-side.model";

@Component({
  selector: 'app-table-client-side',
  standalone: true,
  imports: [
    AppTableComponent,
    AppSimpleFilterComponent,
    AppAdvancedFilterComponent,
    AppPaginationComponent,
    AppCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app-table-client-side.component.scss',
  templateUrl: './app-table-client-side.component.html'
})
export class AppTableClientSideComponent<T extends Record<string, unknown>> {
  readonly tableConfig = input.required<AppTableConfig<T>>();
  readonly filtersConfig = input<AppFiltersConfig>();
  readonly useAdvancedFilters = input<boolean>(false);
  readonly showPagination = input<boolean>(true);
  readonly paginationConfig = input<AppPaginationConfig>();

  readonly data = input<T[]>([]);
  readonly loading = input(false);
  readonly filterFn = input<AppTableFilterFn<T>>();
  readonly sortFn = input<AppTableSortFn<T>>();

  sortChange = output<AppTableSort>();
  filtersChange = output<AppFilterCriterion[]>();
  pageChange = output<AppPageEvent>();
  rowClick = output<T>();
  actionClick = output<{ action: AppTableAction<T>; row: T }>();

  readonly projectedCellTemplate = contentChild<TemplateRef<unknown>>('cellTemplate');
  readonly currentSort = signal<AppTableSort>({ active: '', direction: '' });
  readonly currentFilters = signal<AppFilterCriterion[]>([]);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  private readonly filteredData = computed(() => {
    const data = this.data();
    const criteria = this.currentFilters();

    if (criteria.length === 0) return data;

    const customFn = this.filterFn();
    return customFn
      ? customFn(data, criteria)
      : evaluateCriteria(data, criteria);
  });

  private readonly sortedData = computed(() => {
    const data = this.filteredData();
    const sort = this.currentSort();

    if (!sort.active || !sort.direction) return data;

    const customFn = this.sortFn();
    return customFn ? customFn(data, sort) : this.defaultSort(data, sort);
  });

  readonly displayData = computed(() => {
    const data = this.sortedData();
    if (!this.showPagination()) return data;

    const start = this.pageIndex() * this.pageSize();
    return data.slice(start, start + this.pageSize());
  });

  readonly paginationState = computed<AppPaginationState>(() => ({
    pageIndex: this.pageIndex(),
    pageSize: this.pageSize(),
    totalItems: this.sortedData().length,
  }));

  private readonly _boundaryGuard = effect(() => {
    const totalItems = this.sortedData().length;
    const pageSize = this.pageSize();
    const currentPage = this.pageIndex();
    const lastPage = Math.max(0, Math.ceil(totalItems / pageSize) - 1);

    if (currentPage > lastPage) {
      this.pageIndex.set(lastPage);
    }
  });

  onFiltersChange(criteria: AppFilterCriterion[]): void {
    this.currentFilters.set(criteria);
    this.pageIndex.set(0);
    this.filtersChange.emit(criteria);
  }

  onSortChange(sort: AppTableSort): void {
    this.currentSort.set(sort);
    this.sortChange.emit(sort);
  }

  onPageChange(event: AppPageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.pageChange.emit(event);
  }

  private defaultSort(data: T[], sort: AppTableSort): T[] {
    const key = sort.active as keyof T;
    
    return [...data].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }
}