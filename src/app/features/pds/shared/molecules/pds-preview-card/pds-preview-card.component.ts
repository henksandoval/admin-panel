import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-pds-preview-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIcon],
  template: `
    <mat-card appearance="outlined" class="overflow-hidden">
      <mat-card-header>
        <div class="flex items-center gap-2">
          <mat-icon class="text-base">visibility</mat-icon>
          <mat-card-title class="font-semibold text-sm uppercase tracking-wide">Live Preview</mat-card-title>
        </div>
      </mat-card-header>
      <mat-card-content class="p-6">
        <div class="preview-container flex items-center justify-center min-h-[120px] py-6 bg-center rounded-lg border shadow-sm">
          <ng-content />
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styleUrl: 'pds-preview-card.component.scss'
})
export class PdsPreviewCardComponent {}
