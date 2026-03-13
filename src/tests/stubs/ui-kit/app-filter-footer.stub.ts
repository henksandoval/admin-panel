import { Component, input, output } from '@angular/core';
import { AppFilterToggle } from '@ui-molecules/app-filters/app-filter.model';

@Component({
  selector: 'app-filter-footer',
  standalone: true,
  template: `
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
}
