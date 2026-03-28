import { AppTableSort } from '@ui-atoms/app-table';
import { AppFilterCriterion } from '@ui-molecules/app-filters';
import { APP_TABLE_DEFAULTS } from '../app-table.model';

export type AppTableFilterFn<T> = (data: T[], criteria: AppFilterCriterion[]) => T[];
export type AppTableSortFn<T> = (data: T[], sort: AppTableSort) => T[];

export const TABLE_CLIENT_SIDE_DEFAULTS = APP_TABLE_DEFAULTS;
