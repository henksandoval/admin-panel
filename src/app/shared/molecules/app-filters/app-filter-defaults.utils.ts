import { Signal, computed } from '@angular/core';
import { AppFiltersConfig, FILTER_DEFAULTS } from './app-filter.model';

type FilterDefaultKey = keyof typeof FILTER_DEFAULTS;
type FilterDefaultValue<K extends FilterDefaultKey> = typeof FILTER_DEFAULTS[K];

export function createDefaultComputed<K extends FilterDefaultKey>(
  config: Signal<AppFiltersConfig>,
  key: K
): Signal<FilterDefaultValue<K>> {
  return computed(() => {
    const configValue = config()[key];
    return (configValue !== undefined ? configValue : FILTER_DEFAULTS[key]) as FilterDefaultValue<K>;
  });
}



