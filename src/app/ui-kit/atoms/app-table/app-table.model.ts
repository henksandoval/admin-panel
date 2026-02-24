export type TableColumnAlign = 'left' | 'center' | 'right';
export type TableSortDirection = 'asc' | 'desc' | '';

export interface AppTableColumn<T = unknown> {
  key: string;
  header?: string;
  width?: string;
  minWidth?: string;
  align?: TableColumnAlign;
  sortable?: boolean;
  sticky?: 'start' | 'end';
  headerClass?: string;
  cellClass?: string | ((row: T) => string);
  valueFormatter?: (value: unknown, row: T) => string;
  isHidden?: boolean;
}

export interface AppTableAction<T = unknown> {
  icon: string;
  label: string;
  color?: 'primary' | 'accent' | 'warn';
  visible?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
}

export interface AppTableSort {
  active: string;
  direction: TableSortDirection;
}

export interface AppTableConfig<T = unknown> {
  columns: AppTableColumn<T>[];
  actions?: AppTableAction<T>[];
  trackByKey?: keyof T;
  stickyHeader?: boolean;
  rowClass?: string | ((row: T) => string);
  emptyMessage?: string;
  clickableRows?: boolean;
}

export const TABLE_DEFAULTS = {
  stickyHeader: false,
  clickableRows: false,
  emptyMessage: 'No hay datos disponibles',
} as const;