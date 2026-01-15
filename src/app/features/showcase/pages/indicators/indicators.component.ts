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
    return `// Badge with notification count
<button mat-icon-button matBadge="8" matBadgeColor="warn">
  <mat-icon>notifications</mat-icon>
</button>

// Badge with custom positioning
<button mat-icon-button matBadge="3" matBadgePosition="below after" matBadgeColor="accent">
  <mat-icon>mail</mat-icon>
</button>

// Badge with text content
<span matBadge="NEW" matBadgeOverlap="false" matBadgeColor="primary">
  New Feature Available
</span>

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