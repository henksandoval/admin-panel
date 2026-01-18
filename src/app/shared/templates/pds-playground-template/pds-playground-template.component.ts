import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PdsCodeBlockComponent } from '@shared/molecules/pds-code-block/pds-code-block.component';
import { PdsApiReferenceComponent } from '@shared/molecules/pds-api-reference/pds-api-reference.component';
import { PdsBestPracticesComponent } from '@shared/molecules/pds-best-practices/pds-best-practices.component';
import { PdsApiReferencePropertyModel } from '@shared/molecules/pds-api-reference/pds-api-reference-property.model';
import { PdsBestPracticeItemModel } from '@shared/molecules/pds-best-practices/pds-best-practice-item.model';

/**
 * Template reutilizable para páginas PDS (Pattern Design System)
 *
 * Proporciona un layout consistente con:
 * - Header con título y descripción
 * - Grid de 2 columnas (playground + documentación)
 * - Live Preview
 * - Controls
 * - Generated Code
 * - API Reference (full width)
 * - Best Practices (full width)
 *
 * Uso:
 * ```html
 * <pds-playground-template
 *   [generatedCode]="generatedCode()"
 *   [apiProperties]="API_PROPERTIES"
 *   [bestPractices]="BEST_PRACTICES"
 *   [componentTag]="'<app-button>'">
 *
 *   <div header>...</div>
 *   <div preview>...</div>
 *   <div controls>...</div>
 *   <div documentation>...</div>
 * </pds-playground-template>
 * ```
 */
@Component({
  selector: 'pds-playground-template',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    PdsCodeBlockComponent,
    PdsApiReferenceComponent,
    PdsBestPracticesComponent
  ],
  templateUrl: './pds-playground-template.component.html',
  styleUrl: './pds-playground-template.component.scss'
})
export class PdsPlaygroundTemplateComponent {
  /** Código HTML generado dinámicamente para el snippet */
  generatedCode = input.required<string>();

  /** Propiedades de la API del componente para la tabla de referencia */
  apiProperties = input.required<PdsApiReferencePropertyModel[]>();

  /** Lista de mejores prácticas para mostrar */
  bestPractices = input.required<PdsBestPracticeItemModel[]>();

  /** Tag HTML del componente (ej: '<app-button>') */
  componentTag = input.required<string>();
}
