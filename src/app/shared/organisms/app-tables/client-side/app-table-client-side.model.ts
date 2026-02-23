import { AppTableSort } from "@atoms/app-table/app-table.model";
import { AppFilterCriterion } from "@molecules/app-filters/app-filter.model";
import { APP_TABLE_DEFAULTS } from "../app-table.model";

export type AppTableFilterFn<T> = (data: T[], criteria: AppFilterCriterion[]) => T[];
export type AppTableSortFn<T> = (data: T[], sort: AppTableSort) => T[];

export const TABLE_CLIENT_SIDE_DEFAULTS = APP_TABLE_DEFAULTS;
