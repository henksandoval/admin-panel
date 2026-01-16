import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { AppBadgeComponent } from '@shared/atoms/app-badge/app-badge.component';

@Component({
  selector: 'app-indicators',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
    MatListModule,
    AppBadgeComponent
  ],
  templateUrl: './indicators.component.html',
  styleUrl: './indicators.component.scss'
})
export class IndicatorsComponent {
  private router = inject(Router);

  notificationCount = 8;
  messageCount = 3;
  cartItems = 12;

  goBack() {
    this.router.navigate(['/showcase']);
  }

  get codeExample(): string {
    return `// ===== matBadge (Angular Material - Overlays) =====
// Use for: notifications, counters on icons

// Badge with notification count
<button mat-icon-button matBadge="8" matBadgeColor="warn">
  <mat-icon>notifications</mat-icon>
</button>

// Badge with custom positioning
<button mat-icon-button matBadge="3" matBadgePosition="below after" matBadgeColor="accent">
  <mat-icon>mail</mat-icon>
</button>

// Badge with text content (not recommended for labels)
<span matBadge="NEW" matBadgeOverlap="false" matBadgeColor="primary">
  New Feature Available
</span>


// ===== app-badge Component (Unified System) =====
// Use for: status labels, tags, navigation badges

// Inline badges - Basic semantic variants
<app-badge variant="inline" color="normal">Count: 3</app-badge>
<app-badge variant="inline" color="info">Info</app-badge>
<app-badge variant="inline" color="success">Active</app-badge>
<app-badge variant="inline" color="warning">Pending</app-badge>
<app-badge variant="inline" color="error">Critical</app-badge>

// Inline badges with alert indicator (!)
<app-badge variant="inline" color="warning" [hasIndicator]="true">Action Required</app-badge>
<app-badge variant="inline" color="error" [hasIndicator]="true">Urgent</app-badge>

// In navigation (sidebar)
<div class="flex items-center gap-3">
  <mat-icon>dashboard</mat-icon>
  <span class="flex-1">Dashboard</span>
  <app-badge variant="inline" color="normal">5</app-badge>
</div>

// As status labels
<app-badge variant="inline" color="info">NEW</app-badge> Feature announcement

// Overlay badges (wraps content with matBadge)
<app-badge variant="overlay" [content]="8" color="warn">
  <button mat-icon-button><mat-icon>notifications</mat-icon></button>
</app-badge>


// ===== Other Components =====

// Divider variations
<mat-divider></mat-divider>
<mat-divider [vertical]="true"></mat-divider>
<mat-divider [inset]="true"></mat-divider>

// Advanced tooltips
<button mat-raised-button
        matTooltip="This tooltip appears after 1 second"
        matTooltipShowDelay="1000"
        matTooltipHideDelay="500"
        matTooltipPosition="above">
  Custom Delay
</button>`;
  }
}
