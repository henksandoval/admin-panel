import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
export class IndicatorsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private intervalId?: number;

  notificationCount = 8;
  messageCount = 3;
  cartItems = 12;

  // Contadores en tiempo real
  realtimeCounter = 0;
  simulatedOrders = 5;
  liveNotifications = 1;

  ngOnInit() {
    // Simular actualizaciones en tiempo real cada 2 segundos
    this.intervalId = window.setInterval(() => {
      // Incrementar contador simple
      this.realtimeCounter++;

      // Simular nuevas órdenes (máximo 99)
      if (this.simulatedOrders < 99) {
        this.simulatedOrders++;
      } else {
        this.simulatedOrders = 0;
      }

      // Simular notificaciones aleatorias (entre 0 y 15)
      this.liveNotifications = Math.floor(Math.random() * 16);
    }, 2000);
  }

  ngOnDestroy() {
    // Limpiar el intervalo cuando se destruye el componente
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

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

// Badge condicional (oculto cuando es 0)
<app-badge variant="overlay" [content]="count" [hidden]="count === 0" color="warn">
  <button mat-icon-button><mat-icon>notifications</mat-icon></button>
</app-badge>

// ===== Badges en Tiempo Real =====
// Los badges se actualizan automáticamente cuando cambia la propiedad del componente

// En el componente TypeScript:
export class MyComponent implements OnInit, OnDestroy {
  realtimeCounter = 0;
  private intervalId?: number;

  ngOnInit() {
    // Actualizar cada 2 segundos
    this.intervalId = window.setInterval(() => {
      this.realtimeCounter++;
    }, 2000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// En el template:
<app-badge variant="overlay" [content]="realtimeCounter" color="primary">
  <button mat-icon-button>
    <mat-icon>timer</mat-icon>
  </button>
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

// Badge inline con valor dinámico (tiempo real)
<app-badge variant="inline" color="info">{{ realtimeCounter }}</app-badge>
<app-badge variant="inline" color="success">Orders: {{ simulatedOrders }}</app-badge>

// Badge inline condicional con indicador
<app-badge variant="inline" color="error" [hasIndicator]="count > 5">
  Critical: {{ count }}
</app-badge>

// En navegación con valores dinámicos
<div class="flex items-center gap-3">
  <mat-icon>shopping_bag</mat-icon>
  <span class="flex-1">Pending Orders</span>
  <app-badge variant="inline" color="info" [hasIndicator]="orders > 5">
    {{ orders }}
  </app-badge>
</div>



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
