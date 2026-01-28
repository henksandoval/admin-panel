import { Component, input, model, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

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
        class="!rounded-xl overflow-hidden border border-[var(--mat-sys-outline-variant)] shadow-none"
        hideToggle
      >
        <!-- HEADER -->
        <mat-expansion-panel-header class="!h-auto !py-3 !px-4 bg-[var(--mat-sys-surface-container)] border-b border-[var(--mat-sys-outline-variant)]">
          <div class="flex items-center justify-between w-full">

            <!-- Título e Icono (Izquierda) -->
            <div class="flex items-center gap-2">
              @if (icon()) {
                <mat-icon class="text-base text-[var(--mat-sys-primary)]">{{ icon() }}</mat-icon>
              }
              <span class="font-semibold text-sm tracking-wide text-[var(--mat-sys-on-surface)]">
                {{ title() }}
              </span>
            </div>

            <!-- Icono de toggle personalizado (Derecha) -->
            <!-- Usamos una rotación manual para tener control total del estilo -->
            <mat-icon
              class="transition-transform duration-300 text-[var(--mat-sys-on-surface-variant)]"
              [class.rotate-180]="expanded()">
              expand_more
            </mat-icon>

          </div>
        </mat-expansion-panel-header>

        <!-- CONTENIDO -->
        <div class="pt-4 text-[var(--mat-sys-on-surface-variant)]">
          <ng-content></ng-content>
        </div>

      </mat-expansion-panel>
    </mat-accordion>
  `,
  styles: `
    /* Ajustes finos para eliminar estilos por defecto de Material que no queremos */
    :host {
      display: block;
    }

    /* Eliminar el padding por defecto del body del panel para controlarlo nosotros */
    ::ng-deep .mat-expansion-panel-body {
      padding: 0 1.5rem 1.5rem 1.5rem !important;
    }

    /* Asegurar que el header no cambie de altura al expandirse (comportamiento default de material) */
    ::ng-deep .mat-expansion-panel-header.mat-expanded {
      height: auto !important;
    }
  `,
  encapsulation: ViewEncapsulation.None
})
export class AppCardExpandableComponent {
  title = input.required<string>();
  icon = input<string>();

  // Usamos model() para permitir two-way binding [(expanded)]="isExpanded"
  expanded = model<boolean>(true);
}
