import { AppAdvancedFiltersConfig, AppSimpleFiltersConfig } from "@shared/molecules/app-filters/app-filter.model";

export function convertToAdvancedConfig(
  simpleConfig: AppSimpleFiltersConfig
): AppAdvancedFiltersConfig {
  return {
    fields: simpleConfig.fields.map(f => ({
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
