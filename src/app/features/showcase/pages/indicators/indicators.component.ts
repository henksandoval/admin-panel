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
    MatListModule
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


// ===== app-badge (Custom - Inline) =====
// Use for: status labels, tags, navigation badges

// Basic semantic variants
<span class="app-badge normal">Count: 3</span>
<span class="app-badge info">Info</span>
<span class="app-badge success">Active</span>
<span class="app-badge warning">Pending</span>
<span class="app-badge error">Critical</span>

// With alert indicator (!)
<span class="app-badge warning has-indicator">Action Required</span>
<span class="app-badge error has-indicator">Urgent</span>

// In navigation (sidebar)
<div class="flex items-center gap-3">
  <mat-icon>dashboard</mat-icon>
  <span class="flex-1">Dashboard</span>
  <span class="app-badge normal">5</span>
</div>

// As status labels
<span class="app-badge info">NEW</span> Feature announcement


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
