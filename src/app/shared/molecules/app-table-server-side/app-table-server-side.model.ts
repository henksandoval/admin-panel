import { AppTableSort } from '@shared/atoms/app-table/app-table.model';
import { AppTableFilterValues } from '@shared/molecules/app-table-filters/app-table-filters.model';

/**
 * Parámetros que el componente emite al servidor para cargar datos.
 */
export interface AppTableServerParams {
  filters: AppTableFilterValues;
  sort: AppTableSort;
  pageIndex: number;
  pageSize: number;
}

/**
 * Respuesta esperada del servidor con datos paginados.
 */
export interface AppTableServerResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Valores por defecto para el componente de tabla server-side.
 */
export const TABLE_SERVER_SIDE_DEFAULTS = {
  initialPageIndex: 0,
  initialPageSize: 10,
  resetPageOnFilter: true,
  resetPageOnSort: false,
} as const;

