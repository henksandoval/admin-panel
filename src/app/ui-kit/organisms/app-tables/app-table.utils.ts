import { AppTableSort } from '@ui-atoms/app-table/app-table.model';
import { AnyRecord } from './app-table.model';

export function defaultTableSort<T extends AnyRecord>(data: T[], sort: AppTableSort): T[] {
  const key = sort.active as keyof T;

  return [...data].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    const comparison = aVal < bVal ? -1 : 1;
    return sort.direction === 'asc' ? comparison : -comparison;
  });
}

export function calcLastPage(totalItems: number, pageSize: number): number {
  return Math.max(0, Math.ceil(totalItems / pageSize) - 1);
}

