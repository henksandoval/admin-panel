import { AppTableSort } from "@shared/atoms/app-table/app-table.model";
import { AppFilterCriterion, AppFilterValues } from "@shared/molecules/app-filters/app-filter.model";

export type AppTableFilterFn<T> = (data: T[], filters: AppFilterValues) => T[];
export type AppTableCriteriaFilterFn<T> = (data: T[], criteria: AppFilterCriterion[]) => T[];
export type AppTableToggleFilterFn<T> = (data: T[], toggles: Record<string, boolean>) => T[];
export type AppTableSortFn<T> = (data: T[], sort: AppTableSort) => T[];