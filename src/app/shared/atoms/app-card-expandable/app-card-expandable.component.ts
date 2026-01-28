import { Component, input, model, contentChild, Directive, ViewEncapsulation, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

// --- Directivas reutilizadas del AppCard para mantener consistencia ---
@Directive({ selector: '[slot=header-actions]', standalone: true })
export class CardHeaderActionsDirective {}

@Directive({ selector: '[slot=footer]', standalone: true })
export class CardFooterActionsDirective {}

@Component({
  selector: 'app-card-expandable',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule],
  template: `
    <mat-accordion class="app-card-expandable" displayMode="flat">
      <mat-expansion-panel
        [expanded]="expanded()"
        (opened)="expanded.set(true)"
        (closed)="expanded.set(false)"
        [disabled]="!isExpandable()"
        class="!rounded-xl overflow-hidden transition-all duration-200"
        [ngClass]="containerClasses()"
        hideToggle
      >
        <!-- HEADER -->
        <mat-expansion-panel-header
          class="!h-auto !py-3 !px-4 bg-[var(--mat-sys-surface-container)]"
          [class.border-b]="expanded()"
          [class.border-[var(--mat-sys-outline-variant)]]="expanded()"
        >
          <div class="flex items-center justify-between w-full">

            <!-- IZQUIERDA: Título e Icono -->
            <div class="flex items-center gap-2">
              @if (icon()) {
                <mat-icon class="text-base text-[var(--mat-sys-primary)]">{{ icon() }}</mat-icon>
              }
              @if (title()) {
                <span class="font-semibold text-sm tracking-wide text-[var(--mat-sys-on-surface)]">
                  {{ title() }}
                </span>
              }
            </div>

            <!-- DERECHA: Acciones + Toggle -->
            <div class="flex items-center gap-2">

              <!-- Slot de Acciones (Header Actions) -->
              <!-- Nota: Los botones aquí deben tener (click)="$event.stopPropagation()" para no colapsar el panel -->
              <ng-content select="[slot=header-actions]"></ng-content>

              <!-- Icono de toggle (Solo si es expandible) -->
              @if (isExpandable()) {
                <mat-icon
                  class="transition-transform duration-300 text-[var(--mat-sys-on-surface-variant)]"
                  [class.rotate-180]="expanded()">
                  expand_more
                </mat-icon>
              }
            </div>

          </div>
        </mat-expansion-panel-header>

        <!-- CONTENIDO + FOOTER -->
        <!-- Envolvemos todo en un div para controlar el padding dinámicamente -->
        <div [class]="contentPadding()">

          <!-- Contenido Principal -->
          <div class="text-[var(--mat-sys-on-surface-variant)]">
            <ng-content></ng-content>
          </div>

          <!-- Footer (Si existe) -->
          @if (hasFooter()) {
            <div class="mt-4 pt-3 border-t border-[var(--mat-sys-outline-variant)] flex items-center">
              <ng-content select="[slot=footer]"></ng-content>
            </div>
          }
        </div>

      </mat-expansion-panel>
    </mat-accordion>
  `,
  styles: `
    :host {
      display: block;
    }

    /* Reseteamos el padding por defecto de Material a 0
       para que el input 'contentPadding' tenga control total sobre el espaciado interno */
    ::ng-deep .mat-expansion-panel-body {
      padding: 0 !important;
    }

    /* Asegurar que el header no cambie de altura al expandirse */
    ::ng-deep .mat-expansion-panel-header.mat-expanded {
      height: auto !important;
    }

    /* Estilo para estado deshabilitado */
    ::ng-deep .mat-expansion-panel-header.mat-expansion-panel-header-disabled {
      opacity: 1 !important;
      cursor: default !important;
    }
  `,
  encapsulation: ViewEncapsulation.None
})
export class AppCardExpandableComponent {
  // --- Inputs idénticos al AppCard ---
  title = input<string>(); // Ahora es opcional como en AppCard
  icon = input<string>();
  variant = input<'outlined' | 'raised'>('outlined');
  contentPadding = input<string>('p-6'); // Padding dinámico
  customClass = input<string>('');

  // --- Inputs específicos del Expandable ---
  isExpandable = input<boolean>(true);
  expanded = model<boolean>(true);

  // --- Queries para detectar contenido ---
  headerActions = contentChild(CardHeaderActionsDirective);
  footerContent = contentChild(CardFooterActionsDirective);

  // --- Computados ---
  hasFooter = computed(() => Boolean(this.footerContent()));

  // Lógica para combinar clases de variante + clases custom
  containerClasses = computed(() => {
    const baseClasses = this.customClass();

    // Lógica de variantes visuales
    if (this.variant() === 'outlined') {
      return `${baseClasses} border border-[var(--mat-sys-outline-variant)] shadow-none`;
    } else {
      // Raised (default material shadow, sin borde)
      return `${baseClasses} border-none shadow-md`;
    }
  });
}
