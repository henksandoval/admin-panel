import { AppTableSort } from '@shared/atoms/app-table/app-table.model';
import { AppFilterValues } from '@shared/molecules/app-filters/app-filter.model';
import { APP_TABLE_DEFAULTS } from '../app-table.model';

export interface AppTableServerParams {
  filters: AppFilterValues;
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

export const TABLE_SERVER_SIDE_DEFAULTS = APP_TABLE_DEFAULTS;
