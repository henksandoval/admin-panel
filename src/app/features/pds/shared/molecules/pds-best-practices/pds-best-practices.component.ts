import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PdsBestPracticeItemModel } from './pds-best-practice-item.model';

@Component({
  selector: 'app-pds-best-practices',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <section class="best-practices">
      <div class="section-header">
        <div class="section-header-row">
          <div class="section-icon-container">
            <mat-icon class="section-icon">tips_and_updates</mat-icon>
          </div>
          <div>
            <h2 class="section-title">{{ title }}</h2>
            <p class="section-subtitle">
              Mejores prácticas para
              <code class="inline-code">{{ componentTag }}</code>
            </p>
          </div>
        </div>
      </div>

      <div class="practices-grid">
        @for (practice of practices; track practice.label) {
          <div class="practice-item">
            <mat-icon class="practice-icon">{{ practice.icon }}</mat-icon>
            <div class="practice-content">
              <h4 class="practice-label">{{ practice.label }}</h4>
              <p class="practice-text">{{ practice.text }}</p>
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