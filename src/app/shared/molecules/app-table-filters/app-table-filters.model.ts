export interface AppTableFilterConfig {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'select' | 'date';
  options?: AppTableFilterOption[];
  width?: string;
}

export interface AppTableFilterOption {
  value: any;
  label: string;
}

export interface AppTableFiltersConfig {
  filters: AppTableFilterConfig[];
  debounceMs?: number;
  appearance?: 'fill' | 'outline';
  showClearAll?: boolean;
  clearAllLabel?: string;
}

export type AppTableFilterValue = string | number | boolean | Date | null;

export type AppTableFilterValues = Record<string, AppTableFilterValue>;

export const FILTERS_DEFAULTS = {
  debounceMs: 300,
  appearance: 'outline' as const,
  showClearAll: true,
  clearAllLabel: 'Limpiar filtros',
} as const;