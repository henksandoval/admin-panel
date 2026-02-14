import { AppTableSort } from "@shared/atoms/app-table/app-table.model";
import { AppTableFilterCriterion } from "@shared/molecules/app-filters/app-table-filters-advanced.model";
import { AppTableFilterValues } from "@shared/molecules/app-filters/app-table-filters.model";

export type AppTableFilterFn<T> = (data: T[], filters: AppTableFilterValues) => T[];
export type AppTableCriteriaFilterFn<T> = (data: T[], criteria: AppTableFilterCriterion[]) => T[];
export type AppTableToggleFilterFn<T> = (data: T[], toggles: Record<string, boolean>) => T[];
export type AppTableSortFn<T> = (data: T[], sort: AppTableSort) => T[];