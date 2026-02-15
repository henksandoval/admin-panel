import { AppTableSort } from '@shared/atoms/app-table/app-table.model';
import { AppSimpleFilterValues } from '@shared/molecules/app-filters/app-filter.model';

export interface AppTableServerParams {
  filters: AppSimpleFilterValues;
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

