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
    return `// ===== app-badge Component (Sistema Unificado) =====
// Los desarrolladores SIEMPRE deben usar app-badge, no matBadge directo

// ===== Overlay Badges (Notificaciones sobre iconos) =====
// El componente gestiona internamente el matBadge de Angular Material

// Badge básico con contador
<app-badge variant="overlay" [content]="8" color="warn">
  <button mat-icon-button>
    <mat-icon>notifications</mat-icon>
  </button>
</app-badge>

// Badge con posicionamiento personalizado
<app-badge variant="overlay" content="3" position="below after" color="accent">
  <button mat-icon-button>
    <mat-icon>mail</mat-icon>
  </button>
</app-badge>

// Badge con texto (no recomendado para etiquetas)
<app-badge variant="overlay" content="NEW" [overlap]="false" color="primary">
  <span>New Feature Available</span>
</app-badge>

// Badge condicional (oculto cuando es 0)
<app-badge variant="overlay" [content]="count" [hidden]="count === 0" color="warn">
  <button mat-icon-button><mat-icon>notifications</mat-icon></button>
</app-badge>


// ===== Inline Badges (Etiquetas y estados) =====
// Para etiquetas, estados y navegación

// Variantes semánticas básicas
<app-badge variant="inline" color="normal">Count: 3</app-badge>
<app-badge variant="inline" color="info">Info</app-badge>
<app-badge variant="inline" color="success">Active</app-badge>
<app-badge variant="inline" color="warning">Pending</app-badge>
<app-badge variant="inline" color="error">Critical</app-badge>

// Con indicador de alerta (!)
<app-badge variant="inline" color="warning" [hasIndicator]="true">Action Required</app-badge>
<app-badge variant="inline" color="error" [hasIndicator]="true">Urgent</app-badge>

// En navegación (sidebar)
<div class="flex items-center gap-3">
  <mat-icon>dashboard</mat-icon>
  <span class="flex-1">Dashboard</span>
  <app-badge variant="inline" color="normal">5</app-badge>
</div>

// Como etiquetas de estado
<app-badge variant="inline" color="info">NEW</app-badge> Feature announcement


// ===== Otros Componentes =====

// Variaciones de dividers
<mat-divider></mat-divider>
<mat-divider [vertical]="true"></mat-divider>
<mat-divider [inset]="true"></mat-divider>

// Tooltips avanzados
<button mat-raised-button
        matTooltip="This tooltip appears after 1 second"
        matTooltipShowDelay="1000"
        matTooltipHideDelay="500"
        matTooltipPosition="above">
  Custom Delay
</button>`;
  }
}
