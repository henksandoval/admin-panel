import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {PdsBestPracticeItemModel} from './pds-best-practice-item.model';

@Component({
  selector: 'app-pds-best-practices',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="alert-tip border rounded-xl p-6 flex gap-4">
      <mat-icon class="shrink-0">tips_and_updates</mat-icon>
      <div>
        <h3 class="alert-title font-bold mb-2">{{ title }}</h3>
        <ul class="alert-content space-y-2 text-sm">
          @for (practice of practices; track practice.label) {
            <li class="flex gap-2">
              <span class="alert-label">{{ practice.label }}:</span>
              {{ practice.text }}
            </li>
          }
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .alert-tip {
      background-color: var(--mat-sys-tertiary-container);
      border-color: var(--mat-sys-tertiary);
      color: var(--mat-sys-on-tertiary-container);

      mat-icon {
        color: var(--mat-sys-tertiary);
      }
    }

    .alert-title {
      color: var(--mat-sys-on-tertiary-container);
    }

    .alert-content {
      color: var(--mat-sys-on-tertiary-container);
      opacity: 0.9;
    }

    .alert-label {
      color: var(--mat-sys-tertiary);
      font-weight: 600;
    }
  `]
})
export class PdsBestPracticesComponent {
  @Input() title = 'Best Practices';
  @Input({ required: true }) practices!: PdsBestPracticeItemModel[];
}
