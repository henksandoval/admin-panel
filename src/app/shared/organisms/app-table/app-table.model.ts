export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'custom' | 'actions';
export type ColumnAlign = 'left' | 'center' | 'right';
export type DataMode = 'client' | 'server';

export interface AppTableColumnConfig<T = any> {
  key: string;
  header: string;
  type?: ColumnType;
  align?: ColumnAlign;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  minWidth?: string;
  sticky?: 'start' | 'end';
  cellClass?: string | ((row: T) => string);
  headerClass?: string;
  valueFormatter?: (value: any, row: T) => string;
  visible?: boolean;
}

export interface AppTableActionConfig<T = any> {
  icon: string;
  label: string;
  color?: 'primary' | 'accent' | 'warn';
  visible?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
  action: (row: T) => void;
}

export interface AppTablePaginationConfig {
  pageSize: number;
  pageSizeOptions?: number[];
  showFirstLastButtons?: boolean;
  hidePageSize?: boolean;
}

export interface AppTableSelectionConfig<T = any> {
  enabled: boolean;
  mode?: 'single' | 'multiple';
  selectableRows?: (row: T) => boolean;
}

export interface AppTableSortState {
  active: string;
  direction: 'asc' | 'desc' | '';
}

export interface AppTableFilterState {
  [key: string]: any;
}

export interface AppTableDataRequest {
  page: number;
  pageSize: number;
  sort?: AppTableSortState;
  filters?: AppTableFilterState;
}

export interface AppTableDataResponse<T = any> {
  data: T[];
  total: number;
}

export interface AppTableConfig<T = any> {
  columns: AppTableColumnConfig<T>[];
  actions?: AppTableActionConfig<T>[];
  dataMode?: DataMode;
  pagination?: AppTablePaginationConfig;
  selection?: AppTableSelectionConfig<T>;
  showFilter?: boolean;
  filterDebounce?: number;
  stickyHeader?: boolean;
  minHeight?: string;
  maxHeight?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  rowClass?: string | ((row: T) => string);
  rowClick?: (row: T) => void;
}

export type AppTableOptions<T = any> = Partial<AppTableConfig<T>> & {
  columns: AppTableColumnConfig<T>[];
};
