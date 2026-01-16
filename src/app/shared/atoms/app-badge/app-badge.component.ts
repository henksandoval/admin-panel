import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { BadgeVariant, BadgeColor, BadgePosition, BadgeSize } from './app-badge.model';

/**
 * app-badge: Componente wrapper que unifica badges inline y overlay
 *
 * Casos de uso:
 * 1. Variant 'inline': Badges como etiquetas de estado, categorías, tags
 * 2. Variant 'overlay': Badges superpuestos sobre iconos/botones (notificaciones)
 *
 * @example
 * // Badge inline
 * <app-badge variant="inline" color="success">NEW</app-badge>
 *
 * // Badge overlay
 * <app-badge variant="overlay" [content]="5" color="warn">
 *   <button mat-icon-button><mat-icon>notifications</mat-icon></button>
 * </app-badge>
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule, MatBadgeModule],
  template: `
    <!-- 1. Capturamos el contenido proyectado en un template oculto -->
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>

    @if (variant() === 'inline') {
      <!-- Inline badge -->
      <span
        [class]="inlineClasses()"
        [attr.aria-label]="ariaLabel()">
        <!-- 2. Renderizamos el template aquí -->
        <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
      </span>
    } @else {
      <!-- Overlay badge -->
      <div
        [matBadge]="content()"
        [matBadgeColor]="overlayColor()"
        [matBadgePosition]="position()"
        [matBadgeSize]="matBadgeSize()"
        [matBadgeOverlap]="overlap()"
        [matBadgeHidden]="hidden()"
        [attr.aria-label]="ariaLabel()">
        <!-- 2. O lo renderizamos aquí -->
        <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
      </div>
    }
  `,
  styleUrls: ['./app-badge.component.scss']
})
export class AppBadgeComponent {
  // Común para ambos tipos
  variant = input<BadgeVariant>('inline');
  color = input<BadgeColor>('normal');
  size = input<BadgeSize>('medium');
  ariaLabel = input<string>();

  // Específico para inline
  hasIndicator = input<boolean>(false);

  // Específico para overlay
  content = input<string | number>('');
  position = input<BadgePosition>('above after');
  overlap = input<boolean>(true);
  hidden = input<boolean>(false);

  /**
   * Clases para badges inline (custom CSS)
   */
  inlineClasses = computed(() => {
    const classes: string[] = ['app-badge'];

    // Color
    classes.push(this.color());

    // Indicador
    if (this.hasIndicator()) {
      classes.push('has-indicator');
    }

    // Tamaño
    if (this.size() !== 'medium') {
      classes.push(`badge-size-${this.size()}`);
    }

    return classes.join(' ');
  });

  /**
   * Color para matBadge (solo acepta primary/accent/warn)
   */
  overlayColor = computed(() => {
    const color = this.color();
    if (color === 'primary' || color === 'accent' || color === 'warn') {
      return color;
    }
    return 'primary'; // fallback
  });

  /**
   * Tamaño para matBadge
   */
  matBadgeSize = computed(() => {
    const size = this.size();
    if (size === 'medium') {
      return 'medium' as const;
    }
    return size;
  });
}

