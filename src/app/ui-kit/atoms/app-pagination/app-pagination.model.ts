export interface AppPaginationConfig {
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

export interface AppPaginationState {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
}

export interface AppPageEvent {
  pageIndex: number;
  pageSize: number;
  previousPageIndex: number;
}

export const PAGINATION_DEFAULTS: Required<AppPaginationConfig> = {
  pageSizeOptions: [10, 25, 50, 100],
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