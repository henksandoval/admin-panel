import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-pds-preview-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card appearance="outlined" class="overflow-hidden">
      <div class="card-header border-b px-6 py-4">
        <h3 class="card-title font-semibold flex items-center gap-2">
          <span>🎨</span> Live Preview
        </h3>
      </div>
      <mat-card-content class="p-8">
        <div class="preview-container flex items-center justify-center min-h-[160px] bg-center rounded-lg border shadow-sm">
          <ng-content />
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .card-header {
      background-color: var(--mat-sys-surface-container-low);
      border-color: var(--mat-sys-outline-variant);
    }

    .card-title {
      color: var(--mat-sys-on-surface);
    }

    .preview-container {
      border-color: var(--mat-sys-outline-variant);
      background-image: url('https://bg.ibelick.com/dot-grid.svg');
    }
  `]
})
export class PdsPreviewCardComponent {}
