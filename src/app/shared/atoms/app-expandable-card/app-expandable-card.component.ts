import { Component, input, signal, contentChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-expandable-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  animations: [
    // Definimos la animación de altura suave
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0px', visibility: 'hidden', opacity: 0 })),
      state('expanded', style({ height: '*', visibility: 'visible', opacity: 1 })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
    ])
  ],
  template: `
    <mat-card class="overflow-hidden w-full bg-white" [class.border-blue-500]="expanded()">

      <!-- HEADER: Siempre visible -->
      <!-- Hacemos que todo el header sea clickeable si es colapsable -->
      <div
        class="flex items-center justify-between px-4 py-3 min-h-[56px] select-none transition-colors"
        [class.cursor-pointer]="collapsible()"
        [class.hover:bg-gray-50]="collapsible()"
        (click)="toggle()">

        <!-- IZQUIERDA: Icono y Títulos -->
        <div class="flex items-center gap-3 overflow-hidden">
          @if (icon()) {
            <mat-icon class="text-gray-500">{{ icon() }}</mat-icon>
          }
          <div class="flex flex-col truncate">
            <span class="text-sm font-medium text-gray-900 truncate">{{ title() }}</span>
            @if (subtitle()) {
              <span class="text-xs text-gray-500 truncate">{{ subtitle() }}</span>
            }
          </div>
        </div>

        <!-- DERECHA: Acciones y Toggle -->
        <div class="flex items-center gap-1 ml-4">

          <!-- Slot para botones extra (ej: Copiar código) -->
          <!-- Usamos (click) stopPropagation para que no colapse al dar click en la acción -->
          <div (click)="$event.stopPropagation()">
            <ng-content select="[header-actions]"></ng-content>
          </div>

          <!-- Botón de Toggle (Solo si es collapsible) -->
          @if (collapsible()) {
            <button mat-icon-button
              [disabled]="disabled()"
              class="transition-transform duration-200 text-gray-500"
              [class.rotate-180]="expanded()">
              <mat-icon>expand_more</mat-icon>
            </button>
          }
        </div>
      </div>

      <!-- BODY: Animado -->
      <div [@expandCollapse]="expansionState()">

        <!-- Separador sutil -->
        <div class="border-t border-gray-100"></div>

        <!-- Contenido Principal -->
        <div class="p-4">
          <ng-content></ng-content>
        </div>

        <!-- Footer (Opcional) -->
        <!-- Detectamos si hay contenido en el footer para renderizar el borde -->
        <div class="bg-gray-50 border-t border-gray-100 px-4 py-2">
           <ng-content select="[footer]"></ng-content>
        </div>
      </div>

    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ExpandableCardComponent {
  // Inputs requeridos y opcionales
  title = input.required<string>();
  subtitle = input<string>();
  icon = input<string>();

  // Configuración
  collapsible = input<boolean>(true);
  startExpanded = input<boolean>(false);
  disabled = input<boolean>(false);

  // Estado interno
  // Inicializamos basado en startExpanded
  private _expanded = signal(false);

  // Computado para la animación
  expansionState = computed(() => this._expanded() ? 'expanded' : 'collapsed');
  expanded = this._expanded.asReadonly();

  ngOnInit() {
    // Sincronizar estado inicial
    if (this.startExpanded()) {
      this._expanded.set(true);
    }
  }

  toggle() {
    if (this.collapsible() && !this.disabled()) {
      this._expanded.update(v => !v);
    }
  }

  open() {
    this._expanded.set(true);
  }

  close() {
    this._expanded.set(false);
  }
}
