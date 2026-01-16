import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { AppBadgeComponent } from '@shared/atoms/app-badge/app-badge.component';
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { BadgeSize } from '@shared/atoms/app-badge/app-badge.model';

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    AppBadgeComponent,
    AppButtonComponent
  ],
  templateUrl: './badges.component.html',
  styleUrl: './badges.component.scss'
})
export default class BadgesComponent {
  private readonly router = inject(Router);

  // Signals para controles interactivos
  size = signal<BadgeSize>('medium');

  // Datos para overlay badges
  notificationCount = signal(8);
  messageCount = signal(3);

  goBack() {
    this.router.navigate(['/pds']);
  }

  get inlineExamples(): string {
    return `// Badges inline - Para etiquetas, estados, categorías

// Básico con variantes semánticas
<app-badge variant="inline" color="normal">Count: 5</app-badge>
<app-badge variant="inline" color="info">Info</app-badge>
<app-badge variant="inline" color="success">Active</app-badge>
<app-badge variant="inline" color="warning">Pending</app-badge>
<app-badge variant="inline" color="error">Critical</app-badge>

// Con indicador de alerta
<app-badge variant="inline" color="warning" [hasIndicator]="true">
  Action Required
</app-badge>

// Diferentes tamaños
<app-badge variant="inline" color="info" size="small">Small</app-badge>
<app-badge variant="inline" color="info" size="medium">Medium</app-badge>
<app-badge variant="inline" color="info" size="large">Large</app-badge>

// En navegación
<div class="flex items-center gap-3">
  <mat-icon>dashboard</mat-icon>
  <span class="flex-1">Dashboard</span>
  <app-badge variant="inline" color="normal">5</app-badge>
</div>`;
  }

  get overlayExamples(): string {
    return `// Badges overlay - Para notificaciones sobre iconos/botones

// Básico con contador
<app-badge variant="overlay" [content]="8" color="warn">
  <button mat-icon-button>
    <mat-icon>notifications</mat-icon>
  </button>
</app-badge>

// Con diferentes colores
<app-badge variant="overlay" [content]="3" color="primary">
  <button mat-icon-button>
    <mat-icon>shopping_cart</mat-icon>
  </button>
</app-badge>

// Con posicionamiento personalizado
<app-badge
  variant="overlay"
  [content]="5"
  color="accent"
  position="below after">
  <button mat-icon-button>
    <mat-icon>mail</mat-icon>
  </button>
</app-badge>

// Sin overlap (sin superposición)
<app-badge
  variant="overlay"
  content="NEW"
  color="primary"
  [overlap]="false">
  <span class="px-3 py-2">Feature Available</span>
</app-badge>

// Condicional (ocultar cuando es 0)
<app-badge
  variant="overlay"
  [content]="count"
  color="warn"
  [hidden]="count === 0">
  <button mat-icon-button>
    <mat-icon>notifications</mat-icon>
  </button>
</app-badge>

// Diferentes tamaños
<app-badge variant="overlay" [content]="5" color="warn" size="small">
  <button mat-icon-button>
    <mat-icon>notifications</mat-icon>
  </button>
</app-badge>`;
  }

  get migrationGuide(): string {
    return `// Migración desde badges antiguos

// ANTES: matBadge directo
<button mat-icon-button matBadge="5" matBadgeColor="warn">
  <mat-icon>notifications</mat-icon>
</button>

// DESPUÉS: app-badge overlay
<app-badge variant="overlay" [content]="5" color="warn">
  <button mat-icon-button>
    <mat-icon>notifications</mat-icon>
  </button>
</app-badge>

// ----------------------------------------

// ANTES: span.app-badge custom
<span class="app-badge warning has-indicator">Pending</span>

// DESPUÉS: app-badge inline
<app-badge variant="inline" color="warning" [hasIndicator]="true">
  Pending
</app-badge>`;
  }
}

