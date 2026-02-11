import { Component, signal, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppTableFiltersAdvancedComponent } from '@shared/molecules/app-table-filters-advanced/app-table-filters-advanced.component';
import {
  AppTableFiltersAdvancedConfig,
  AppTableFiltersAdvancedOutput,
  AppTableFilterCriterion,
} from '@shared/molecules/app-table-filters-advanced/app-table-filters-advanced.model';

/**
 * Ejemplo de uso de AppTableFiltersAdvancedComponent
 * Demuestra cómo configurar y usar el filtro avanzado tipo query builder
 */
@Component({
  selector: 'app-table-filters-advanced-example',
  standalone: true,
  imports: [AppTableFiltersAdvancedComponent, MatSnackBarModule, JsonPipe],
  template: `
    <div class="p-6">
      <h1 class="mat-headline-large mb-4">Filtros Avanzados - Ejemplo</h1>
      <p class="mat-body-medium mb-6">
        Query builder visual con criterios tipo "pills" y operadores explícitos.
      </p>

      <app-table-filters-advanced
        [config]="filtersConfig"
        (search)="onSearch($event)"
        (criteriaChange)="onCriteriaChange($event)"
        (toggleChange)="onToggleChange($event)"
      />

      <!-- Debug Output -->
      <div class="mt-6 p-4 rounded-lg" style="background: var(--mat-sys-surface-variant)">
        <h2 class="mat-title-medium mb-3">Output (Debug)</h2>

        <div class="mb-4">
          <strong class="mat-label-large">Criterios:</strong>
          <pre class="mt-2 p-3 rounded" style="background: var(--mat-sys-surface); overflow-x: auto">{{ lastCriteria() | json }}</pre>
        </div>

        <div>
          <strong class="mat-label-large">Toggles:</strong>
          <pre class="mt-2 p-3 rounded" style="background: var(--mat-sys-surface); overflow-x: auto">{{ lastToggles() | json }}</pre>
        </div>
      </div>
    </div>
  `,
})
export class TableFiltersAdvancedExampleComponent {
  private snackBar = inject(MatSnackBar);

  readonly lastCriteria = signal<AppTableFilterCriterion[]>([]);
  readonly lastToggles = signal<Record<string, boolean>>({});

  readonly filtersConfig: AppTableFiltersAdvancedConfig = {
    fields: [
      {
        key: 'name',
        label: 'Nombre',
        type: 'text'
      },
      {
        key: 'email',
        label: 'Email',
        type: 'text'
      },
      {
        key: 'createdAt',
        label: 'Fecha de Creación',
        type: 'date'
      },
      {
        key: 'age',
        label: 'Edad',
        type: 'number'
      },
      {
        key: 'salary',
        label: 'Salario',
        type: 'number'
      },
      {
        key: 'status',
        label: 'Estado',
        type: 'select',
        options: [
          { value: 'active', label: 'Activo' },
          { value: 'inactive', label: 'Inactivo' },
          { value: 'pending', label: 'Pendiente' },
          { value: 'suspended', label: 'Suspendido' }
        ]
      },
      {
        key: 'department',
        label: 'Departamento',
        type: 'select',
        options: [
          { value: 'engineering', label: 'Ingeniería' },
          { value: 'sales', label: 'Ventas' },
          { value: 'marketing', label: 'Marketing' },
          { value: 'hr', label: 'Recursos Humanos' },
          { value: 'finance', label: 'Finanzas' }
        ]
      },
      {
        key: 'verified',
        label: 'Verificado',
        type: 'boolean'
      },
      {
        key: 'active',
        label: 'Activo',
        type: 'boolean'
      }
    ],
    toggles: [
      { key: 'showInactive', label: 'Mostrar inactivos', value: false },
      { key: 'showDeleted', label: 'Mostrar eliminados', value: false },
      { key: 'includeArchived', label: 'Incluir archivados', value: false }
    ],
    autoSearch: false,
    maxCriteria: 10,
    showClearButton: true,
    showSearchButton: true,
  };

  onSearch(output: AppTableFiltersAdvancedOutput): void {
    this.lastCriteria.set(output.criteria);
    this.lastToggles.set(output.toggles);

    // Construir mensaje resumido
    const criteriaCount = output.criteria.length;
    const togglesActive = Object.values(output.toggles).filter(v => v).length;

    let message = `Búsqueda ejecutada: ${criteriaCount} criterio(s)`;
    if (togglesActive > 0) {
      message += `, ${togglesActive} toggle(s) activo(s)`;
    }

    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });

    console.log('🔍 Búsqueda ejecutada:', output);

    // Aquí harías la petición al servidor
    // this.userService.search(output.criteria, output.toggles).subscribe(...);
  }

  onCriteriaChange(criteria: AppTableFilterCriterion[]): void {
    this.lastCriteria.set(criteria);
    console.log('📝 Criterios cambiaron:', criteria);
  }

  onToggleChange(toggles: Record<string, boolean>): void {
    this.lastToggles.set(toggles);
    console.log('🔘 Toggles cambiaron:', toggles);
  }
}



