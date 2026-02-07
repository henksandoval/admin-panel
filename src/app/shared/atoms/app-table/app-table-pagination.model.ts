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

export const PAGINATION_DEFAULTS = {
  pageSizeOptions: [10, 25, 50, 100] as number[],
  showFirstLastButtons: true,
  showPageSizeSelector: true,
  itemsPerPageLabel: 'Items por página:',
  pageLabel: 'Página',
  ofLabel: 'de',
  firstPageLabel: 'Primera página',
  lastPageLabel: 'Última página',
  previousPageLabel: 'Página anterior',
  nextPageLabel: 'Página siguiente',
};