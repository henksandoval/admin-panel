import { CheckboxColor, CheckboxSize, CheckboxLabelPosition } from '@shared/atoms/app-checkbox/app-checkbox.model';

/**
 * Ejemplos de casos de uso comunes para checkboxes
 */
export interface CheckboxUseCase {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
}

export const COMMON_USE_CASES: CheckboxUseCase[] = [
  {
    title: 'Acepto términos y condiciones',
    description: 'Checkbox requerido en formularios de registro',
    checked: false
  },
  {
    title: 'Recordar sesión',
    description: 'Mantener la sesión activa',
    checked: true
  },
  {
    title: 'Recibir notificaciones',
    description: 'Opción deshabilitada temporalmente',
    checked: false,
    disabled: true
  },
  {
    title: 'Seleccionar todos',
    description: 'Estado indeterminado cuando hay selección parcial',
    checked: false,
    indeterminate: true
  }
];

/**
 * Ejemplos de uso con diferentes configuraciones
 */
export interface UsageExample {
  title: string;
  code: string;
  description: string;
}

export const USAGE_EXAMPLES: UsageExample[] = [
  {
    title: 'Básico',
    code: `<app-checkbox>
  Acepto los términos
</app-checkbox>`,
    description: 'Checkbox simple con label'
  },
  {
    title: 'Con two-way binding',
    code: `<app-checkbox [(checked)]="isAccepted">
  Acepto términos
</app-checkbox>`,
    description: 'Sincronización bidireccional del estado'
  },
  {
    title: 'Con evento change',
    code: `<app-checkbox
  (changed)="onCheckboxChange($event)">
  Notificaciones
</app-checkbox>`,
    description: 'Escucha cambios de estado'
  },
  {
    title: 'Deshabilitado',
    code: `<app-checkbox
  [disabled]="true"
  [checked]="true">
  Opción no disponible
</app-checkbox>`,
    description: 'Checkbox deshabilitado'
  },
  {
    title: 'Indeterminado',
    code: `<app-checkbox
  [indeterminate]="true">
  Seleccionar todos
</app-checkbox>`,
    description: 'Estado parcialmente seleccionado'
  },
  {
    title: 'Requerido',
    code: `<app-checkbox
  [required]="true">
  Acepto términos *
</app-checkbox>`,
    description: 'Campo obligatorio en formularios'
  },
  {
    title: 'Label antes',
    code: `<app-checkbox
  labelPosition="before">
  Label a la izquierda
</app-checkbox>`,
    description: 'Posición del label invertida'
  },
  {
    title: 'Tamaño personalizado',
    code: `<app-checkbox size="large">
  Checkbox grande
</app-checkbox>`,
    description: 'Cambia el tamaño del checkbox'
  },
  {
    title: 'Color secundario',
    code: `<app-checkbox color="secondary">
  Color secundario
</app-checkbox>`,
    description: 'Usa color secundario del tema'
  }
];

/**
 * Guías de uso por contexto
 */
export interface ContextGuide {
  context: string;
  description: string;
  recommendations: string[];
  examples: string[];
}

export const CONTEXT_GUIDES: ContextGuide[] = [
  {
    context: 'Formularios',
    description: 'Acepta términos, permisos y opciones binarias',
    recommendations: [
      'Usa labels claros y concisos',
      'Marca como required los campos obligatorios',
      'Agrupa checkboxes relacionados',
      'Usa labelPosition="after" (default) para alineación consistente'
    ],
    examples: [
      'Aceptar términos y condiciones',
      'Suscribirse al newsletter',
      'Recordar contraseña'
    ]
  },
  {
    context: 'Tablas y Listas',
    description: 'Selección múltiple de elementos',
    recommendations: [
      'Usa checkbox en la primera columna',
      'Implementa "Seleccionar todos" con indeterminate',
      'Usa size="small" para compactar',
      'Sin label para checkboxes de selección'
    ],
    examples: [
      'Seleccionar filas de tabla',
      'Marcar tareas completadas',
      'Selección masiva de items'
    ]
  },
  {
    context: 'Configuraciones',
    description: 'Activar/desactivar funcionalidades',
    recommendations: [
      'Usa labels descriptivos',
      'Agrupa por categoría',
      'Muestra el estado actual claramente',
      'Considera disabled para opciones no disponibles'
    ],
    examples: [
      'Habilitar notificaciones push',
      'Modo oscuro',
      'Sincronización automática'
    ]
  },
  {
    context: 'Filtros',
    description: 'Filtrado múltiple de contenido',
    recommendations: [
      'Agrupa filtros por categoría',
      'Permite múltiple selección',
      'Muestra cantidad de resultados',
      'Usa "Limpiar filtros" para resetear'
    ],
    examples: [
      'Filtrar por categoría',
      'Filtrar por estado',
      'Filtrar por rango de precio'
    ]
  }
];

/**
 * Comparación entre Checkbox y otros componentes
 */
export interface ComponentComparison {
  component: string;
  whenToUse: string;
  example: string;
}

export const COMPONENT_COMPARISONS: ComponentComparison[] = [
  {
    component: 'Checkbox',
    whenToUse: 'Opciones múltiples independientes',
    example: 'Seleccionar toppings de pizza (múltiples)'
  },
  {
    component: 'Radio Button',
    whenToUse: 'Una sola opción de un grupo',
    example: 'Seleccionar tamaño de pizza (única)'
  },
  {
    component: 'Toggle/Switch',
    whenToUse: 'Activar/desactivar con efecto inmediato',
    example: 'Activar modo oscuro (cambio inmediato)'
  },
  {
    component: 'Select/Dropdown',
    whenToUse: 'Muchas opciones en poco espacio',
    example: 'Seleccionar país (muchas opciones)'
  }
];

