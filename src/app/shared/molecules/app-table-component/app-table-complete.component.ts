import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  ChangeDetectionStrategy, contentChild, TemplateRef,
} from '@angular/core';
import { AppTableComponent } from '@shared/atoms/app-table/app-table.component';
import {
  AppTableConfig,
  AppTableSort,
  AppTableAction,
} from '@shared/atoms/app-table/app-table.model';
import { AppTableFiltersComponent } from '@shared/molecules/app-table-filters/app-table-filters.component';
import {
  AppTableFiltersConfig,
  AppTableFilterValues,
} from '@shared/molecules/app-table-filters/app-table-filters.model';
import { AppTablePaginationComponent } from '@shared/atoms/app-table/app-table-pagination.component';
import {
  AppTablePaginationConfig,
  AppTablePaginationState,
  AppTablePageEvent,
} from '@shared/atoms/app-table/app-table-pagination.model';
import { AppTableFilterFn, AppTableSortFn } from './app-table-complete.model';

@Component({
  selector: 'app-table-complete',
  standalone: true,
  imports: [
    AppTableComponent,
    AppTableFiltersComponent,
    AppTablePaginationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./app-table-complete.component.scss'],
  template: `
    <div class="app-table-complete">
      @if (filtersConfig()) {
        <app-table-filters
          [config]="filtersConfig()!"
          [values]="filterValues()"
          (valuesChange)="onFiltersChange($event)">
        </app-table-filters>
      }

      <app-table
        [config]="tableConfig()"
        [data]="displayData()"
        [sort]="currentSort()"
        [loading]="loading()"
        [cellTemplateRef]="projectedCellTemplate()"
        (sortChange)="onSortChange($event)"
        (rowClick)="rowClick.emit($event)"
        (actionClick)="actionClick.emit($event)">
        <ng-content />
      </app-table>

      @if (paginationConfig()) {
        <app-table-pagination
          [config]="paginationConfig()!"
          [state]="paginationState()"
          (pageChange)="onPageChange($event)">
        </app-table-pagination>
      }
    </div>
  `,
})
export class AppTableCompleteComponent<T extends Record<string, any> = Record<string, any>> {
  tableConfig = input.required<AppTableConfig<T>>();
  filtersConfig = input<AppTableFiltersConfig>();
  paginationConfig = input<AppTablePaginationConfig>();

  data = input<T[]>([]);
  loading = input(false);

  filterFn = input<AppTableFilterFn<T>>();
  sortFn = input<AppTableSortFn<T>>();

  sortChange = output<AppTableSort>();
  filterChange = output<AppTableFilterValues>();
  pageChange = output<AppTablePageEvent>();
  rowClick = output<T>();
  actionClick = output<{ action: AppTableAction<T>; row: T }>();

  readonly projectedCellTemplate = contentChild<TemplateRef<any>>('cellTemplate');
  readonly currentSort = signal<AppTableSort>({ active: '', direction: '' });
  readonly filterValues = signal<AppTableFilterValues>({});
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  private readonly filteredData = computed(() => {
    const data = this.data();
    const filters = this.filterValues();

    if (!Object.keys(filters).length) return data;

    const customFn = this.filterFn();
    return customFn ? customFn(data, filters) : this.defaultFilterFn(data, filters);
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

  readonly paginationState = computed<AppTablePaginationState>(() => ({
    pageIndex: this.pageIndex(),
    pageSize: this.pageSize(),
    totalItems: this.sortedData().length,
  }));

  private readonly boundaryGuard = effect(() => {
    const totalItems = this.sortedData().length;
    const pageSize = this.pageSize();
    const currentPage = this.pageIndex();
    const lastPage = Math.max(0, Math.ceil(totalItems / pageSize) - 1);

    if (currentPage > lastPage) {
      this.pageIndex.set(lastPage);
    }
  }, { allowSignalWrites: true });

  onFiltersChange(values: AppTableFilterValues): void {
    this.filterValues.set(values);
    this.pageIndex.set(0);
    this.filterChange.emit(values);
  }

  onSortChange(sort: AppTableSort): void {
    this.currentSort.set(sort);
    this.sortChange.emit(sort);
  }

  onPageChange(event: AppTablePageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.pageChange.emit(event);
  }

  private defaultFilterFn(data: T[], filters: AppTableFilterValues): T[] {
    const activeFilters = Object.entries(filters).filter(
      ([, v]) => v !== null && v !== undefined && v !== '',
    );
    if (!activeFilters.length) return data;

    return data.filter((item) =>
      activeFilters.every(([key, filterValue]) => {
        const itemValue: unknown = (item as Record<string, unknown>)[key];
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
