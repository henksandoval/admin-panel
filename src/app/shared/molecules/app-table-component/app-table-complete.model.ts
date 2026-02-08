import { AppTableSort } from '@shared/atoms/app-table/app-table.model';
import { AppTableFilterValues } from '@shared/molecules/app-table-filters/app-table-filters.model';

export type AppTableFilterFn<T> = (data: T[], filters: AppTableFilterValues) => T[];
export type AppTableSortFn<T> = (data: T[], sort: AppTableSort) => T[];