export type AppFilterFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export type AppFilterValue = string | number | boolean | Date | null;

export interface AppFilterOption {
  value: AppFilterValue;
  label: string;
}

export interface AppFilterField {
  key: string;
  label: string;
  type: AppFilterFieldType;
  options?: AppFilterOption[];
}

export interface AppFilterOperator {
  key: string;
  label: string;
  symbol: string;
  applicableTo: AppFilterFieldType[];
  requiresValue: boolean;
}

export interface AppFilterCriterion {
  id: string;
  field: AppFilterField;
  operator: AppFilterOperator;
  value: AppFilterValue;
}

export interface AppFilterToggle {
  key: string;
  label: string;
  value: boolean;
}

export const DEFAULT_FILTER_OPERATORS: AppFilterOperator[] = [
  { key: 'eq',           label: 'Igual a',        symbol: '=',  applicableTo: ['text', 'number', 'date', 'select', 'boolean'], requiresValue: true },
  { key: 'neq',          label: 'Diferente de',   symbol: '≠',  applicableTo: ['text', 'number', 'date', 'select'],            requiresValue: true },
  { key: 'contains',     label: 'Contiene',       symbol: '∋',  applicableTo: ['text'],                                        requiresValue: true },
  { key: 'not_contains', label: 'No contiene',    symbol: '∌',  applicableTo: ['text'],                                        requiresValue: true },
  { key: 'starts_with',  label: 'Empieza con',    symbol: 'A…', applicableTo: ['text'],                                        requiresValue: true },
  { key: 'ends_with',    label: 'Termina con',    symbol: '…Z', applicableTo: ['text'],                                        requiresValue: true },
  { key: 'gt',           label: 'Mayor que',      symbol: '>',  applicableTo: ['number', 'date'],                              requiresValue: true },
  { key: 'gte',          label: 'Mayor o igual',  symbol: '≥',  applicableTo: ['number', 'date'],                              requiresValue: true },
  { key: 'lt',           label: 'Menor que',      symbol: '<',  applicableTo: ['number', 'date'],                              requiresValue: true },
  { key: 'lte',          label: 'Menor o igual',  symbol: '≤',  applicableTo: ['number', 'date'],                              requiresValue: true },
  { key: 'is_null',      label: 'Es vacío',       symbol: '∅',  applicableTo: ['text', 'number', 'date', 'select'],            requiresValue: false },
  { key: 'is_not_null',  label: 'No es vacío',    symbol: '!∅', applicableTo: ['text', 'number', 'date', 'select'],            requiresValue: false },
];

export const DEFAULT_OPERATOR_BY_TYPE: Record<AppFilterFieldType, string> = {
  text:    'contains',
  number:  'eq',
  date:    'eq',
  select:  'eq',
  boolean: 'eq',
};

export interface AppSimpleFilterField extends AppFilterField {
  placeholder?: string;
  width?: string;
  defaultOperator?: string;
}

export interface AppSimpleFiltersConfig {
  fields: AppSimpleFilterField[];
  debounceMs?: number;
  appearance?: 'fill' | 'outline';
  showClearAll?: boolean;
  clearAllLabel?: string;
}

export const SIMPLE_FILTER_DEFAULTS = {
  debounceMs: 300,
  appearance: 'outline' as const,
  showClearAll: true,
  clearAllLabel: 'Limpiar filtros',
} as const;

export interface AppAdvancedFiltersConfig {
  fields: AppFilterField[];
  operators?: AppFilterOperator[];
  toggles?: AppFilterToggle[];
  maxCriteria?: number;
  autoSearch?: boolean;
  showClearButton?: boolean;
  showSearchButton?: boolean;
}

export interface AppAdvancedFiltersOutput {
  criteria: AppFilterCriterion[];
  toggles: Record<string, boolean>;
}

export const ADVANCED_FILTER_DEFAULTS = {
  maxCriteria: 10,
  autoSearch: false,
  showClearButton: true,
  showSearchButton: true,
} as const;