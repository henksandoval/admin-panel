import { AppTableFilterValues } from '../app-table-filters-simple/app-table-filters.model';
import { AppTableFilterCriterion } from '../app-table-filters-advanced/app-table-filters-advanced.model';
import { AppTableSort } from '@shared/atoms/app-table/app-table.model';

export type AppTableFilterFn<T> = (data: T[], filters: AppTableFilterValues) => T[];
export type AppTableCriteriaFilterFn<T> = (data: T[], criteria: AppTableFilterCriterion[]) => T[];
export type AppTableToggleFilterFn<T> = (data: T[], toggles: Record<string, boolean>) => T[];
export type AppTableSortFn<T> = (data: T[], sort: AppTableSort) => T[];