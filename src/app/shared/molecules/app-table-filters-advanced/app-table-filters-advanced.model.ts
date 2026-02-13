export type AppTableFilterFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export type FilterValue = string | number | boolean | Date | null;

export interface AppTableFilterField {
  key: string;
  label: string;
  type: AppTableFilterFieldType;
  options?: AppTableFilterOption[];
}

export interface AppTableFilterOption {
  value: FilterValue;
  label: string;
}

export interface AppTableFilterOperator {
  key: string;
  label: string;
  symbol: string;
  applicableTo: AppTableFilterFieldType[];
  requiresValue: boolean;
}

export interface AppTableFilterCriterion {
  id: string;
  field: AppTableFilterField;
  operator: AppTableFilterOperator;
  value: FilterValue;
}

export interface AppTableFilterToggle {
  key: string;
  label: string;
  value: boolean;
}

export interface AppTableFiltersAdvancedConfig {
  fields: AppTableFilterField[];
  operators?: AppTableFilterOperator[];
  toggles?: AppTableFilterToggle[];
  maxCriteria?: number;
  autoSearch?: boolean;
  showClearButton?: boolean;
  showSearchButton?: boolean;
}

export interface AppTableFiltersAdvancedOutput {
  criteria: AppTableFilterCriterion[];
  toggles: Record<string, boolean>;
}

export const DEFAULT_FILTER_OPERATORS: AppTableFilterOperator[] = [
  { key: 'eq', label: 'Igual a', symbol: '=', applicableTo: ['text', 'number', 'date', 'select', 'boolean'], requiresValue: true },
  { key: 'neq', label: 'Diferente de', symbol: '≠', applicableTo: ['text', 'number', 'date', 'select'], requiresValue: true },
  { key: 'contains', label: 'Contiene', symbol: '∋', applicableTo: ['text'], requiresValue: true },
  { key: 'not_contains', label: 'No contiene', symbol: '∌', applicableTo: ['text'], requiresValue: true },
  { key: 'starts_with', label: 'Empieza con', symbol: 'A…', applicableTo: ['text'], requiresValue: true },
  { key: 'ends_with', label: 'Termina con', symbol: '…Z', applicableTo: ['text'], requiresValue: true },
  { key: 'gt', label: 'Mayor que', symbol: '>', applicableTo: ['number', 'date'], requiresValue: true },
  { key: 'gte', label: 'Mayor o igual', symbol: '≥', applicableTo: ['number', 'date'], requiresValue: true },
  { key: 'lt', label: 'Menor que', symbol: '<', applicableTo: ['number', 'date'], requiresValue: true },
  { key: 'lte', label: 'Menor o igual', symbol: '≤', applicableTo: ['number', 'date'], requiresValue: true },
  { key: 'is_null', label: 'Es vacío', symbol: '∅', applicableTo: ['text', 'number', 'date', 'select'], requiresValue: false },
  { key: 'is_not_null', label: 'No es vacío', symbol: '!∅', applicableTo: ['text', 'number', 'date', 'select'], requiresValue: false },
];

export const FILTER_DEFAULTS = {
  maxCriteria: 10,
  autoSearch: false,
  showClearButton: true,
  showSearchButton: true,
} as const;
