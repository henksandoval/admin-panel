// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRecord = Record<string, any>;

export const APP_TABLE_DEFAULTS = {
  useAdvancedFilters: false,
  showPagination: true,
  resetPageOnFilter: true,
  resetPageOnSort: false,
  initialPageIndex: 0,
  initialPageSize: 10,
} as const;

