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
  itemsPerPageLabel: $localize`:Pagination|Items per page label@@pagination.label.itemsPerPage:Items per page:`,
  pageLabel: $localize`:Pagination|Current page label@@pagination.label.page:Page`,
  ofLabel: $localize`:Pagination|Of separator label@@pagination.label.of:of`,
  firstPageLabel: $localize`:Pagination|First page button@@pagination.btn.firstPage:First page`,
  lastPageLabel: $localize`:Pagination|Last page button@@pagination.btn.lastPage:Last page`,
  previousPageLabel: $localize`:Pagination|Previous page button@@pagination.btn.prevPage:Previous page`,
  nextPageLabel: $localize`:Pagination|Next page button@@pagination.btn.nextPage:Next page`,
};