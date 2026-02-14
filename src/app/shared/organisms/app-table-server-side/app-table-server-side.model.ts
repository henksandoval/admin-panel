import { AppTableSort } from '@shared/atoms/app-table/app-table.model';
import { AppTableFilterValues } from '@shared/molecules/app-filters/app-table-filters.model';

export interface AppTableServerParams {
  filters: AppTableFilterValues;
  sort: AppTableSort;
  pageIndex: number;
  pageSize: number;
}

export interface AppTableServerResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const TABLE_SERVER_SIDE_DEFAULTS = {
  initialPageIndex: 0,
  initialPageSize: 10,
  resetPageOnFilter: true,
  resetPageOnSort: false,
} as const;

