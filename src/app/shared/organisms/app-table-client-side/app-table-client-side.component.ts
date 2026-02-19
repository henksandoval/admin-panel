import { Component, ChangeDetectionStrategy, input, output, contentChild, TemplateRef, signal, computed, effect } from "@angular/core";
import { AppCardComponent } from "@shared/atoms/app-card/app-card.component";
import { AppPaginationComponent } from "@shared/atoms/app-pagination/app-pagination.component";
import { AppPaginationConfig, AppPageEvent, AppPaginationState } from "@shared/atoms/app-pagination/app-pagination.model";
import { AppTableComponent } from "@shared/atoms/app-table/app-table.component";
import { AppTableConfig, AppTableSort, AppTableAction } from "@shared/atoms/app-table/app-table.model";
import { AppAdvancedFilterComponent } from "@shared/molecules/app-filters/advanced/app-advanced-filter.component";
import { AppFiltersConfig, AppFilterValues, AppFiltersOutput } from "@shared/molecules/app-filters/app-filter.model";
import { evaluateCriteria } from "@shared/molecules/app-filters/criteria-evaluator.utils";
import { AppSimpleFilterComponent } from "@shared/molecules/app-filters/simple/app-simple-filter.component";
import { AppTableFilterFn, AppTableCriteriaFilterFn, AppTableToggleFilterFn, AppTableSortFn } from "./app-table-client-side.model";

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
export class AppTableClientSideComponent<T extends Record<string, any> = Record<string, any>> {
  readonly tableConfig = input.required<AppTableConfig<T>>();
  readonly filtersConfig = input<AppFiltersConfig>();
  readonly useAdvancedFilters = input<boolean>(false);
  readonly paginationConfig = input<AppPaginationConfig>();

  readonly data = input<T[]>([]);
  readonly loading = input(false);

  readonly filterFn = input<AppTableFilterFn<T>>();
  readonly criteriaFilterFn = input<AppTableCriteriaFilterFn<T>>();
  readonly toggleFilterFn = input<AppTableToggleFilterFn<T>>();
  readonly sortFn = input<AppTableSortFn<T>>();

  sortChange = output<AppTableSort>();
  filtersChange = output<AppFilterValues | AppFiltersOutput>();
  pageChange = output<AppPageEvent>();
  rowClick = output<T>();
  actionClick = output<{ action: AppTableAction<T>; row: T }>();

  readonly projectedCellTemplate = contentChild<TemplateRef<any>>('cellTemplate');
  readonly currentSort = signal<AppTableSort>({ active: '', direction: '' });
  readonly currentFilters = signal<AppFilterValues | AppFiltersOutput>({});
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly simpleFilterValues = computed(() => {
    const filters = this.currentFilters();
    return this.isAdvancedFilters(filters) ? {} : filters;
  });

  private readonly filteredData = computed(() => {
    const data = this.data();
    const filters = this.currentFilters();
    const useAdvanced = this.useAdvancedFilters();

    if (this.isEmptyFilters(filters)) {
      return data;
    }

    if (useAdvanced && this.isAdvancedFilters(filters)) {
      return this.applyAdvancedFilters(data, filters as AppFiltersOutput);
    }

    return this.applySimpleFilters(data, filters as AppFilterValues);
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
    if (!this.paginationConfig()) return data;

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

  onFiltersChange(filters: AppFilterValues | AppFiltersOutput): void {
    this.currentFilters.set(filters);
    this.pageIndex.set(0);
    this.filtersChange.emit(filters);
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

  private isEmptyFilters(filters: AppFilterValues | AppFiltersOutput): boolean {
    if (this.isAdvancedFilters(filters)) {
      return filters.criteria.length === 0;
    }
    return Object.keys(filters).length === 0;
  }

  private isAdvancedFilters(filters: AppFilterValues | AppFiltersOutput): filters is AppFiltersOutput {
    return 'criteria' in filters && 'toggles' in filters;
  }

  private applySimpleFilters(data: T[], filters: AppFilterValues): T[] {
    const activeFilters = Object.entries(filters).filter(
      ([, v]) => v !== null && v !== undefined && v !== '',
    );
    if (!activeFilters.length) return data;

    const customFn = this.filterFn();
    return customFn
      ? customFn(data, filters)
      : this.defaultSimpleFilter(data, filters);
  }

  private applyAdvancedFilters(data: T[], output: AppFiltersOutput): T[] {
    let filtered = data;

    if (output.criteria.length > 0) {
      const customFn = this.criteriaFilterFn();
      filtered = customFn
        ? customFn(filtered, output.criteria)
        : evaluateCriteria(filtered, output.criteria);
    }

    if (Object.keys(output.toggles).length > 0) {
      const customFn = this.toggleFilterFn();
      filtered = customFn ? customFn(filtered, output.toggles) : filtered;
    }

    return filtered;
  }

  private defaultSimpleFilter(data: T[], filters: AppFilterValues): T[] {
    const active = Object.entries(filters).filter(
      ([, v]) => v !== null && v !== undefined && v !== '',
    );
    if (!active.length) return data;

    return data.filter(item =>
      active.every(([key, filterValue]) => {
        const itemValue: unknown = item[key];
        if (itemValue === null || itemValue === undefined) return false;

        if (filterValue instanceof Date && itemValue instanceof Date) {
          return itemValue.getTime() === filterValue.getTime();
        }

        return String(itemValue)
          .toLowerCase()
          .includes(String(filterValue).toLowerCase());
      }),
    );
  }


  private defaultSort(data: T[], sort: AppTableSort): T[] {
    return [...data].sort((a, b) => {
      const aVal = a[sort.active as keyof T];
      const bVal = b[sort.active as keyof T];

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }
}
