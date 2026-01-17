import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {PdsBestPracticeItemModel} from '@shared/molecules/pds-best-practices/pds-best-practice-item.model';

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
  `
})
export class PdsBestPracticesComponent {
  @Input() title = 'Best Practices';
  @Input({ required: true }) practices!: PdsBestPracticeItemModel[];
}
