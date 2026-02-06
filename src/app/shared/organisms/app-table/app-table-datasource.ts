import { computed, signal, Signal } from '@angular/core';
import { 
  AppTableDataRequest, 
  AppTableDataResponse, 
  AppTableFilterState, 
  AppTableSortState 
} from './app-table.model';

export class AppTableDataSource<T> {
  private dataSignal = signal<T[]>([]);
  private serverTotalSignal = signal<number>(0);
  private loadingSignal = signal<boolean>(false);
  private pageSignal = signal<number>(0);
  private pageSizeSignal = signal<number>(10);
  private sortSignal = signal<AppTableSortState>({ active: '', direction: '' });
  private filtersSignal = signal<AppTableFilterState>({});
  private modeSignal = signal<'client' | 'server'>('client');

  readonly data: Signal<T[]> = this.dataSignal.asReadonly();
  readonly loading: Signal<boolean> = this.loadingSignal.asReadonly();
  readonly page: Signal<number> = this.pageSignal.asReadonly();
  readonly pageSize: Signal<number> = this.pageSizeSignal.asReadonly();
  readonly sort: Signal<AppTableSortState> = this.sortSignal.asReadonly();
  readonly filters: Signal<AppTableFilterState> = this.filtersSignal.asReadonly();

  private readonly filteredData = computed(() => {
    if (!this.isClientMode) {
      return this.dataSignal();
    }
    let result = this.dataSignal();
    const filters = this.filtersSignal();
    result = this.applyFilters(result, filters);
    return result;
  });

  private readonly sortedData = computed(() => {
    if (!this.isClientMode) {
      return this.dataSignal();
    }
    let result = this.filteredData();
    const sort = this.sortSignal();
    result = this.applySort(result, sort);
    return result;
  });

  readonly total = computed(() => {
    if (this.isClientMode) {
      return this.sortedData().length;
    }
    return this.serverTotalSignal();
  });

  readonly displayData = computed(() => {
    if (!this.isClientMode) {
      return this.dataSignal();
    }
    const result = this.sortedData();
    const page = this.pageSignal();
    const pageSize = this.pageSizeSignal();
    return this.applyPagination(result, page, pageSize);
  });

  private get isClientMode(): boolean {
    return this.modeSignal() === 'client';
  }

  private loadDataFn?: (request: AppTableDataRequest) => Promise<AppTableDataResponse<T>>;

  setMode(mode: 'client' | 'server'): void {
    this.modeSignal.set(mode);
  }

  setData(data: T[]): void {
    this.dataSignal.set(data);
  }

  setLoadDataFunction(fn: (request: AppTableDataRequest) => Promise<AppTableDataResponse<T>>): void {
    this.loadDataFn = fn;
    this.setMode('server');
  }

  async loadData(): Promise<void> {
    if (this.isClientMode || !this.loadDataFn) {
      return;
    }

    this.loadingSignal.set(true);
    try {
      const request: AppTableDataRequest = {
        page: this.pageSignal(),
        pageSize: this.pageSizeSignal(),
        sort: this.sortSignal(),
        filters: this.filtersSignal()
      };

      const response = await this.loadDataFn(request);
      this.dataSignal.set(response.data);
      this.serverTotalSignal.set(response.total);
    } catch (error) {
      console.error('Error loading table data:', error);
      this.dataSignal.set([]);
      this.serverTotalSignal.set(0);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  setPage(page: number): void {
    this.pageSignal.set(page);
    if (!this.isClientMode) {
      this.loadData();
    }
  }

  setPageSize(pageSize: number): void {
    this.pageSizeSignal.set(pageSize);
    this.pageSignal.set(0);
    if (!this.isClientMode) {
      this.loadData();
    }
  }

  setSort(sort: AppTableSortState): void {
    this.sortSignal.set(sort);
    if (!this.isClientMode) {
      this.loadData();
    }
  }

  setFilters(filters: AppTableFilterState): void {
    this.filtersSignal.set(filters);
    this.pageSignal.set(0);
    if (!this.isClientMode) {
      this.loadData();
    }
  }

  updateFilter(key: string, value: any): void {
    const current = { ...this.filtersSignal() };
    if (value === null || value === undefined || value === '') {
      delete current[key];
    } else {
      current[key] = value;
    }
    this.setFilters(current);
  }

  clearFilters(): void {
    this.setFilters({});
  }

  private applyFilters(data: T[], filters: AppTableFilterState): T[] {
    if (!filters || Object.keys(filters).length === 0) {
      return data;
    }

    return data.filter(row => {
      return Object.entries(filters).every(([key, filterValue]) => {
        const rowValue = (row as any)[key];
        if (rowValue === null || rowValue === undefined) {
          return false;
        }
        
        const rowValueStr = String(rowValue).toLowerCase();
        const filterValueStr = String(filterValue).toLowerCase();
        
        return rowValueStr.includes(filterValueStr);
      });
    });
  }

  private applySort(data: T[], sort: AppTableSortState): T[] {
    if (!sort.active || !sort.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sort.active];
      const bValue = (b as any)[sort.active];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }

  private applyPagination(data: T[], page: number, pageSize: number): T[] {
    const startIndex = page * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }
}
