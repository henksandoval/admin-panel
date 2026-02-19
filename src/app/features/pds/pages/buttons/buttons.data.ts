import { MatButtonAppearance } from '@angular/material/button';
import {
  PdsApiReferencePropertyModel
} from '../../shared/molecules/pds-api-reference/pds-api-reference-property.model';
import { PdsBestPracticeItemModel } from '../../shared/molecules/pds-best-practices/pds-best-practice-item.model';
import { PdsVariantGuideModel } from '../../shared/templates/pds-page-layout/pds-variant-guide.model';

export interface VariantGuide extends PdsVariantGuideModel {
  readonly variant: MatButtonAppearance;
}

export const VARIANT_GUIDES: VariantGuide[] = [
  {
    variant: 'filled',
    title: 'Filled Buttons',
    description: 'La acción más importante y prominente en la interfaz. Alto énfasis visual con fondo sólido.',
    emphasis: 'high',
    whenToUse: [
      'Acción principal en una pantalla o diálogo',
      'Formularios: botón de "Guardar" o "Submit"',
      'Call-to-action (CTA) importantes',
      'Solo debe haber un filled button por sección'
    ],
    examples: [
      'Guardar cambios',
      'Crear nuevo item',
      'Confirmar acción',
      'Iniciar proceso'
    ]
  },
  {
    variant: 'elevated',
    title: 'Elevated Buttons',
    description: 'Énfasis medio-alto con elevación. Se destaca del fondo pero menos que filled.',
    emphasis: 'high',
    whenToUse: [
      'Acción importante que necesita destacarse del contenido',
      'Cuando filled es muy prominente para el contexto',
      'Interfases con fondos coloridos donde filled no contrasta',
      'Alternativa visual a filled buttons'
    ],
    examples: [
      'Subir archivo',
      'Agregar a favoritos',
      'Compartir contenido',
      'Exportar datos'
    ]
  },
  {
    variant: 'tonal',
    title: 'Tonal Buttons',
    description: 'Énfasis medio con fondo tonal suave. Balance entre prominencia y sutileza.',
    emphasis: 'medium',
    whenToUse: [
      'Acciones secundarias importantes',
      'Cuando quieres más énfasis que outlined pero menos que filled',
      'Grupos de botones relacionados',
      'Acciones frecuentes pero no críticas'
    ],
    examples: [
      'Editar contenido',
      'Filtrar resultados',
      'Ver detalles',
      'Aplicar cambios'
    ]
  },
  {
    variant: 'outlined',
    title: 'Outlined Buttons',
    description: 'Énfasis medio-bajo con borde visible. Claro pero no dominante.',
    emphasis: 'medium',
    whenToUse: [
      'Acciones secundarias o alternativas',
      'Botón de "Cancelar" en diálogos',
      'Acciones que contrastan con la acción principal',
      'Navegación entre pasos'
    ],
    examples: [
      'Cancelar',
      'Atrás / Back',
      'Omitir paso',
      'Descargar'
    ]
  },
  {
    variant: 'text',
    title: 'Text Buttons',
    description: 'Menor énfasis visual. Solo texto con ripple effect. Más sutil y menos intrusivo.',
    emphasis: 'low',
    whenToUse: [
      'Acciones terciarias o de baja prioridad',
      'Navegación interna (enlaces)',
      'Acciones en toolbars o listas densas',
      'Cuando quieres minimizar la distracción visual'
    ],
    examples: [
      'Aprender más',
      'Ver todo',
      'Cerrar',
      'Ayuda'
    ]
  }
];

export const API_PROPERTIES: PdsApiReferencePropertyModel[] = [
  {
    name: 'variant',
    decorator: '@Input()',
    description: 'Controla el estilo visual del botón.',
    type: "'filled' | 'elevated' | 'outlined' | 'text' | 'tonal'",
    defaultValue: 'filled'
  },
  {
    name: 'color',
    decorator: '@Input()',
    description: 'Color semántico del tema.',
    type: "'primary' | 'secondary' | 'tertiary'",
    defaultValue: 'primary'
  },
  {
    name: 'shape',
    decorator: '@Input()',
    description: 'Forma de las esquinas.',
    type: "'rounded' | 'square'",
    defaultValue: 'rounded'
  },
  {
    name: 'size',
    decorator: '@Input()',
    description: 'Tamaño del botón.',
    type: "'small' | 'medium' | 'large'",
    defaultValue: 'medium'
  },
  {
    name: 'disabled',
    decorator: '@Input()',
    description: 'Deshabilita la interacción.',
    type: 'boolean',
    defaultValue: 'false'
  },
  {
    name: 'iconBefore / iconAfter',
    decorator: '@Input()',
    description: 'Nombre del icono Material Design.',
    type: "string (ej: 'star', 'home')",
    optional: true
  }
];

export const BEST_PRACTICES: PdsBestPracticeItemModel[] = [
  { icon: 'priority_high', label: 'Jerarquía', text: 'Usa solo un botón de alto énfasis por sección.' },
  { icon: 'sync_alt', label: 'Consistencia', text: 'Mantén el mismo variant para acciones similares.' },
  { icon: 'chat_bubble_outline', label: 'Diálogos', text: 'Filled para confirmar, Outlined para cancelar.' }
];
