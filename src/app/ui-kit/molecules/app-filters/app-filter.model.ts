export type AppFilterFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export type AppFilterValue = string | number | boolean | Date | null;

export type AppFilterValues = Record<string, AppFilterValue>;

export interface AppFilterOption {
  value: AppFilterValue;
  label: string;
}

export interface AppFilterField {
  key: string;
  label: string;
  type: AppFilterFieldType;
  options?: AppFilterOption[];
  placeholder?: string;
  width?: string;
  defaultOperator?: string;
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

export interface AppFiltersConfig {
  fields: AppFilterField[];
  debounceMs?: number;
  appearance?: 'fill' | 'outline';
  showClearAll?: boolean;
  clearAllLabel?: string;
  operators?: AppFilterOperator[];
  toggles?: AppFilterToggle[];
  maxCriteria?: number;
  autoSearch?: boolean;
  showClearButton?: boolean;
  showSearchButton?: boolean;
}

export const DEFAULT_FILTER_OPERATORS: AppFilterOperator[] = [
  { key: 'eq',          label: $localize`:Filter operator|Equals@@filter.op.eq:Equals`,                symbol: '=',  applicableTo: ['text', 'number', 'date', 'select', 'boolean'], requiresValue: true  },
  { key: 'neq',         label: $localize`:Filter operator|Not equal to@@filter.op.neq:Not equal to`,    symbol: '≠',  applicableTo: ['text', 'number', 'date', 'select'],             requiresValue: true  },
  { key: 'contains',    label: $localize`:Filter operator|Contains@@filter.op.contains:Contains`,        symbol: '∋',  applicableTo: ['text'],                                         requiresValue: true  },
  { key: 'not_contains',label: $localize`:Filter operator|Does not contain@@filter.op.notContains:Does not contain`, symbol: '∌', applicableTo: ['text'],                         requiresValue: true  },
  { key: 'starts_with', label: $localize`:Filter operator|Starts with@@filter.op.startsWith:Starts with`,symbol: 'A…', applicableTo: ['text'],                                   requiresValue: true  },
  { key: 'ends_with',   label: $localize`:Filter operator|Ends with@@filter.op.endsWith:Ends with`,    symbol: '…Z', applicableTo: ['text'],                                         requiresValue: true  },
  { key: 'gt',          label: $localize`:Filter operator|Greater than@@filter.op.gt:Greater than`,    symbol: '>',  applicableTo: ['number', 'date'],                               requiresValue: true  },
  { key: 'gte',         label: $localize`:Filter operator|Greater or equal@@filter.op.gte:Greater or equal`, symbol: '≥', applicableTo: ['number', 'date'],                      requiresValue: true  },
  { key: 'lt',          label: $localize`:Filter operator|Less than@@filter.op.lt:Less than`,          symbol: '<',  applicableTo: ['number', 'date'],                               requiresValue: true  },
  { key: 'lte',         label: $localize`:Filter operator|Less or equal@@filter.op.lte:Less or equal`, symbol: '≤', applicableTo: ['number', 'date'],                              requiresValue: true  },
  { key: 'is_null',     label: $localize`:Filter operator|Is empty@@filter.op.isNull:Is empty`,        symbol: '∅',  applicableTo: ['text', 'number', 'date', 'select'],             requiresValue: false },
  { key: 'is_not_null', label: $localize`:Filter operator|Is not empty@@filter.op.isNotNull:Is not empty`, symbol: '!∅', applicableTo: ['text', 'number', 'date', 'select'],      requiresValue: false },
];

export const DEFAULT_OPERATOR_BY_TYPE: Record<AppFilterFieldType, string> = {
  text: 'contains',
  number: 'eq',
  date: 'eq',
  select: 'eq',
  boolean: 'eq',
};

export const FILTER_DEFAULTS = {
  debounceMs: 300,
  appearance: 'fill' as const,
  showClearAll: true,
  clearAllLabel: $localize`:Filter|Clear all button label@@filters.btn.clearAll:Clear filters`,
  maxCriteria: 10,
  autoSearch: false,
  showClearButton: true,
  showSearchButton: true,
} as const;
