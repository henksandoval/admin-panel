import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {PdsBestPracticeItemModel} from './pds-best-practice-item.model';

@Component({
  selector: 'app-pds-best-practices',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <section class="space-y-4 pt-4" style="border-top: 1px solid var(--mat-sys-outline-variant);">
      <div class="api-section-header mb-6">
        <div class="flex items-center gap-4">
          <div class="api-icon-container p-3 rounded-lg border-2">
            <mat-icon class="text-2xl">tips_and_updates</mat-icon>
          </div>
          <div>
            <h2 class="api-title text-2xl font-bold mb-1">{{ title }}</h2>
            <p class="api-description text-sm">
              Mejores practicas para
              <code class="inline-code px-1.5 py-0.5 rounded text-sm font-mono border">{{ componentTag }}</code>
            </p>
          </div>
        </div>
      </div>
      <div class="practices-grid grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
        @for (practice of practices; track practice.label) {
          <div class="practice-item rounded-xl p-2 flex gap-3">
            <mat-icon class="practice-icon shrink-0">{{ practice.icon }}</mat-icon>
            <div class="practice-content">
              <h4 class="practice-label font-medium mb-1">{{ practice.label }}</h4>
              <p class="practice-text text-sm">{{ practice.text }}</p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styleUrl: 'pds-best-practices.component.scss'
})
export class PdsBestPracticesComponent {
  @Input() title = 'Best Practices';
  @Input({ required: true }) componentTag!: string;
  @Input({ required: true }) practices!: PdsBestPracticeItemModel[];
}
