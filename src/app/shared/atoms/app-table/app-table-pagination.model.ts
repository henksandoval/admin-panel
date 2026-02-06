export interface AppTablePaginationConfig {
  pageSizeOptions?: number[];
  showFirstLastButtons?: boolean;
  showPageSizeSelector?: boolean;
  pageLabel?: string;
  ofLabel?: string;
  itemsPerPageLabel?: string;
  firstPageLabel?: string;
  lastPageLabel?: string;
  previousPageLabel?: string;
  nextPageLabel?: string;
}

export interface AppTablePaginationState {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
}

export interface AppTablePageEvent {
  pageIndex: number;
  pageSize: number;
  previousPageIndex: number;
}