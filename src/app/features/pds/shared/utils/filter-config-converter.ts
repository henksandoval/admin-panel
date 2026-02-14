import { AppFiltersAdvancedConfig, AppFilterCriterion } from "@shared/molecules/app-filters/app-filter.model";
import { AppTableFiltersConfig, AppTableFilterValues } from "@shared/molecules/app-filters/app-table-filters.model";

export function convertToAdvancedConfig(
  simpleConfig: AppTableFiltersConfig
): AppFiltersAdvancedConfig {
  return {
    fields: simpleConfig.filters.map(f => ({
      key: f.key,
      label: f.label,
      type: f.type as any,
      options: f.options,
    })),
    toggles: [
      { key: 'showInactive', label: 'Mostrar inactivos', value: false },
      { key: 'showDeleted', label: 'Mostrar eliminados', value: false },
    ],
    autoSearch: false,
    maxCriteria: 10,
    showClearButton: true,
    showSearchButton: true,
  };
}

export function convertAdvancedToSimple(
  criteria: AppFilterCriterion[]
): AppTableFilterValues {
  return criteria.reduce((acc, c) => {
    if (c.operator.key === 'eq' || c.operator.key === 'contains') {
      acc[c.field.key] = c.value;
    }
    return acc;
  }, {} as AppTableFilterValues);
}


