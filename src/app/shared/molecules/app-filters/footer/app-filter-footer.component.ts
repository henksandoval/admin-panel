import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  effect,
  computed
} from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { AppFilterToggle } from '../app-filter.model';
import { togglesToRecord } from '../app-filter.utils';
import { FILTER_FOOTER_DEFAULTS } from './app-filter-footer.model';

@Component({
  selector: 'app-filter-footer',
  standalone: true,
  imports: [MatDivider, AppButtonComponent, AppCheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-filter-footer.component.html',
  styleUrl: './app-filter-footer.component.scss'
})
export class AppFilterFooterComponent {
  toggles = input<AppFilterToggle[]>([]);
  showClearButton = input<boolean>(FILTER_FOOTER_DEFAULTS.showClearButton);
  showSearchButton = input<boolean>(FILTER_FOOTER_DEFAULTS.showSearchButton);

  toggleChange = output<Record<string, boolean>>();
  clearClick = output<void>();
  searchClick = output<void>();

  readonly internalToggles = signal<AppFilterToggle[]>([]);

  readonly showFooter = computed(() =>
    this.toggles().length > 0 || this.showClearButton() || this.showSearchButton()
  );

  constructor() {
    effect(() => {
      this.internalToggles.set(this.toggles().map(t => ({ ...t })));
    });
  }

  onToggleChange(key: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.internalToggles.update(current =>
      current.map(t => t.key === key ? { ...t, value: checked } : t)
    );
    this.toggleChange.emit(togglesToRecord(this.internalToggles()));
  }

  onClear(): void {
    this.clearClick.emit();
  }

  onSearch(): void {
    this.searchClick.emit();
  }
}


