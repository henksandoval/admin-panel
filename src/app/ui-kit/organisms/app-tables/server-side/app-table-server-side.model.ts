import { AppTableSort } from '@ui-atoms/app-table';
import { AppFilterValues } from '@ui-molecules/app-filters';
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
