import { AppTableFiltersAdvancedConfig, AppTableFilterCriterion } from "@shared/molecules/app-table/app-table-filters-advanced/app-table-filters-advanced.model";
import { AppTableFiltersConfig, AppTableFilterValues } from "@shared/molecules/app-table/app-table-filters-simple/app-table-filters.model";

export function convertToAdvancedConfig(
  simpleConfig: AppTableFiltersConfig
): AppTableFiltersAdvancedConfig {
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
  criteria: AppTableFilterCriterion[]
): AppTableFilterValues {
  return criteria.reduce((acc, c) => {
    if (c.operator.key === 'eq' || c.operator.key === 'contains') {
      acc[c.field.key] = c.value;
    }
    return acc;
  }, {} as AppTableFilterValues);
}


