import { Component, effect, input, output, signal } from '@angular/core';
import { AppFilterToggle } from '@ui-molecules/app-filters/app-filter.model';

@Component({
  selector: 'app-filter-footer',
  standalone: true,
  template: `
    @for (toggle of internalToggles(); track toggle.key) {
      <button type="button" [attr.data-testid]="'filter-toggle-' + toggle.key" (click)="onToggleClick(toggle.key)">
        {{ toggle.label }}
      </button>
    }
    <button data-testid="filter-footer-clear" type="button" (click)="clearClick.emit()">Clear</button>
    <button data-testid="filter-footer-search" type="button" (click)="searchClick.emit()">Search</button>
    @if (showClearButton()) {
      <button data-testid="advanced-filter-clear-button" type="button" (click)="clearClick.emit()">Clear</button>
    }
    @if (showSearchButton()) {
      <button data-testid="advanced-filter-search-button" type="button" (click)="searchClick.emit()">Search</button>
    }
  `,
})
export class AppFilterFooterStubComponent {
  readonly toggles = input<AppFilterToggle[]>([]);
  readonly showClearButton = input<boolean>(true);
  readonly showSearchButton = input<boolean>(true);

  readonly toggleChange = output<Record<string, boolean>>();
  readonly clearClick = output<void>();
  readonly searchClick = output<void>();

  protected readonly internalToggles = signal<AppFilterToggle[]>([]);

  constructor() {
    effect(() => {
      const toggles = this.toggles();
      if (toggles.length > 0) {
        this.internalToggles.set(toggles.map(t => ({ ...t })));
        this.emitToggles();
      }
    });
  }

  protected onToggleClick(key: string): void {
    this.internalToggles.update(current =>
      current.map(t => t.key === key ? { ...t, value: !t.value } : t)
    );
    this.emitToggles();
  }

  private emitToggles(): void {
    const record: Record<string, boolean> = {};
    this.internalToggles().forEach(t => { record[t.key] = t.value; });
    this.toggleChange.emit(record);
  }
}
