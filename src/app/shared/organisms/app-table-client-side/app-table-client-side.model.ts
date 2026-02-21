import { AppTableSort } from "@shared/atoms/app-table/app-table.model";
import { AppFilterCriterion } from "@shared/molecules/app-filters/app-filter.model";

export type AppTableFilterFn<T> = (data: T[], criteria: AppFilterCriterion[]) => T[];
export type AppTableSortFn<T> = (data: T[], sort: AppTableSort) => T[];