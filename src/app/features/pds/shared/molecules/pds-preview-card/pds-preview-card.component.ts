import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppCardComponent} from '@shared/atoms/app-card/app-card.component';

@Component({
  selector: 'app-pds-preview-card',
  standalone: true,
  imports: [CommonModule, AppCardComponent],
  template: `
    <app-card
      title="LIVE PREVIEW"
      icon="visibility"
      customClass="overflow-hidden">
      <div class="preview-container flex items-center justify-center min-h-[120px] py-6 bg-center rounded-lg border shadow-sm">
        <ng-content />
      </div>
    </app-card>
  `,
  styleUrl: 'pds-preview-card.component.scss'
})
export class PdsPreviewCardComponent {}
