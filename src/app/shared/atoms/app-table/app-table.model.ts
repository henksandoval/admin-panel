export type ColumnAlign = 'left' | 'center' | 'right';
export type SortDirection = 'asc' | 'desc' | '';

export interface AppTableColumn<T = any> {
  key: string;
  header: string;
  width?: string;
  minWidth?: string;
  align?: ColumnAlign;
  sortable?: boolean;
  sticky?: 'start' | 'end';
  headerClass?: string;
  cellClass?: string | ((row: T) => string);
  valueFormatter?: (value: any, row: T) => string;
}

export interface AppTableAction<T = any> {
  icon: string;
  label: string;
  color?: 'primary' | 'accent' | 'warn';
  visible?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
}

export interface AppTableSort {
  active: string;
  direction: SortDirection;
}

export interface AppTableConfig<T = any> {
  columns: AppTableColumn<T>[];
  actions?: AppTableAction<T>[];
  trackByKey?: keyof T;
  stickyHeader?: boolean;
  rowClass?: string | ((row: T) => string);
  emptyMessage?: string;
  clickableRows?: boolean;
}