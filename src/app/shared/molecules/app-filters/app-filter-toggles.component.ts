import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { AppFilterToggle } from './app-filter.model';

@Component({
  selector: 'app-filter-toggles',
  standalone: true,
  imports: [AppCheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (toggle of toggles(); track toggle.key) {
      <app-checkbox
        [checked]="toggle.value"
        (change)="toggleChange.emit({ key: toggle.key, event: $event })">
        {{ toggle.label }}
      </app-checkbox>
    }
  `
})
export class AppFilterTogglesComponent {
  toggles = input.required<AppFilterToggle[]>();
  toggleChange = output<{ key: string; event: Event }>();
}


