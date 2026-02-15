import { AppAdvancedFiltersConfig } from "@shared/molecules/app-filters/app-filter.model";
import { AppTableFiltersConfig } from "@shared/molecules/app-filters/app-table-filters.model";

export function convertToAdvancedConfig(
  simpleConfig: AppTableFiltersConfig
): AppAdvancedFiltersConfig {
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
