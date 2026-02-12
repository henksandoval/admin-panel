export type AppTableFilterFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export interface AppTableFilterField {
  key: string;
  label: string;
  type: AppTableFilterFieldType;
  options?: AppTableFilterOption[];
  width?: string;
}

export interface AppTableFilterOption {
  value: any;
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
  value: any;
  displayValue: string;
}

export interface AppTableFilterToggle {
  key: string;
  label: string;
  value: boolean;
}

export interface AppTableFiltersAdvancedConfig {
  fields: AppTableFilterField[];
  toggles?: AppTableFilterToggle[];
  debounceMs?: number;
  autoSearch?: boolean;
  maxCriteria?: number;
  showClearButton?: boolean;
  showSearchButton?: boolean;
}

export interface AppTableFiltersAdvancedOutput {
  criteria: AppTableFilterCriterion[];
  toggles: Record<string, boolean>;
}

export const DEFAULT_FILTER_OPERATORS: AppTableFilterOperator[] = [
  {
    key: 'eq',
    label: 'Igual a',
    symbol: '=',
    applicableTo: ['text', 'number', 'date', 'select', 'boolean'],
    requiresValue: true
  },
  {
    key: 'neq',
    label: 'Diferente de',
    symbol: '≠',
    applicableTo: ['text', 'number', 'date', 'select'],
    requiresValue: true
  },
  {
    key: 'contains',
    label: 'Contiene',
    symbol: '∋',
    applicableTo: ['text'],
    requiresValue: true
  },
  {
    key: 'not_contains',
    label: 'No contiene',
    symbol: '∌',
    applicableTo: ['text'],
    requiresValue: true
  },
  {
    key: 'starts_with',
    label: 'Empieza con',
    symbol: 'A…',
    applicableTo: ['text'],
    requiresValue: true
  },
  {
    key: 'ends_with',
    label: 'Termina con',
    symbol: '…Z',
    applicableTo: ['text'],
    requiresValue: true
  },
  {
    key: 'gt',
    label: 'Mayor que',
    symbol: '>',
    applicableTo: ['number', 'date'],
    requiresValue: true
  },
  {
    key: 'gte',
    label: 'Mayor o igual',
    symbol: '≥',
    applicableTo: ['number', 'date'],
    requiresValue: true
  },
  {
    key: 'lt',
    label: 'Menor que',
    symbol: '<',
    applicableTo: ['number', 'date'],
    requiresValue: true
  },
  {
    key: 'lte',
    label: 'Menor o igual',
    symbol: '≤',
    applicableTo: ['number', 'date'],
    requiresValue: true
  },
  {
    key: 'is_null',
    label: 'Es vacío',
    symbol: '∅',
    applicableTo: ['text', 'number', 'date', 'select'],
    requiresValue: false
  },
  {
    key: 'is_not_null',
    label: 'No es vacío',
    symbol: '!∅',
    applicableTo: ['text', 'number', 'date', 'select'],
    requiresValue: false
  },
];

export const TABLE_FILTERS_ADVANCED_DEFAULTS = {
  debounceMs: 300,
  autoSearch: false,
  maxCriteria: 10,
  showClearButton: true,
  showSearchButton: true,
} as const;
