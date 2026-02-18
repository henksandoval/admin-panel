import { Signal, WritableSignal, signal, effect, OutputEmitterRef } from '@angular/core';
import { AppFilterToggle, AppFiltersConfig } from './app-filter.model';
import { togglesToRecord } from './app-filter.utils';

export interface FilterTogglesHandlers {
  toggles: WritableSignal<AppFilterToggle[]>;
  onToggleChange: (key: string, event: Event) => void;
}

export function createFilterTogglesHandlers(
  config: Signal<AppFiltersConfig>,
  toggleChange: OutputEmitterRef<Record<string, boolean>>,
  onChangeCallback?: () => void
): FilterTogglesHandlers {
  const toggles = signal<AppFilterToggle[]>([]);

  effect(() => {
    toggles.set((config().toggles ?? []).map(t => ({ ...t })));
  });

  const onToggleChange = (key: string, event: Event): void => {
    const checked = (event.target as HTMLInputElement).checked;
    toggles.update(current =>
      current.map(t => t.key === key ? { ...t, value: checked } : t)
    );
    toggleChange.emit(togglesToRecord(toggles()));
    onChangeCallback?.();
  };

  return { toggles, onToggleChange };
}

