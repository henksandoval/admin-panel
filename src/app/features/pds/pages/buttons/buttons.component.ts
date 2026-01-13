import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonAppearance, MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {Router} from '@angular/router';
import {AppButtonComponent} from '@shared/atoms/app-button/app-button.component';
import {ButtonColor, ButtonShape, ButtonSize} from '@shared/atoms/app-button/app-button.model';

interface ButtonConfig {
  readonly variant: MatButtonAppearance;
  readonly color: ButtonColor;
  readonly label: string;
  readonly disabled: boolean;
  readonly iconBefore?: string;
  readonly iconAfter?: string;
}

interface UsageExample {
  readonly title: string;
  readonly description: string;
  readonly code: string;
  readonly demo?: ButtonConfig;
}

interface VariantGuide {
  readonly variant: MatButtonAppearance;
  readonly title: string;
  readonly description: string;
  readonly whenToUse: string[];
  readonly examples: string[];
  readonly emphasis: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatButtonToggleModule,
    AppButtonComponent
  ],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.scss'
})
export default class ButtonsComponent {
  private readonly router = inject(Router);

  shape = signal<ButtonShape>('rounded');
  size = signal<ButtonSize>('medium');

  // Ejemplos con iconos
  readonly iconExamples: ButtonConfig[] = [
    { variant: 'filled', color: 'primary', label: 'Save', disabled: false, iconBefore: 'save' },
    { variant: 'filled', color: 'primary', label: 'Next', disabled: false, iconAfter: 'arrow_forward' },
    { variant: 'outlined', color: 'secondary', label: 'Download', disabled: false, iconBefore: 'download' },
    { variant: 'text', color: 'primary', label: 'Learn More', disabled: false, iconAfter: 'open_in_new' },
    { variant: 'elevated', color: 'tertiary', label: 'Delete', disabled: false, iconBefore: 'delete' },
    { variant: 'tonal', color: 'secondary', label: 'Edit', disabled: false, iconBefore: 'edit' },
  ];

  // Casos de uso comunes
  readonly commonUseCases: ButtonConfig[] = [
    { variant: 'filled', color: 'primary', label: 'Save Changes', disabled: false, iconBefore: 'save' },
    { variant: 'outlined', color: 'secondary', label: 'Cancel', disabled: false },
    { variant: 'text', color: 'primary', label: 'Back', disabled: false, iconBefore: 'arrow_back' },
    { variant: 'tonal', color: 'tertiary', label: 'Delete Item', disabled: false, iconBefore: 'delete' },
    { variant: 'elevated', color: 'primary', label: 'Upload File', disabled: false, iconBefore: 'upload' },
    { variant: 'filled', color: 'secondary', label: 'Submit Form', disabled: false, iconAfter: 'send' },
  ];

  // Ejemplos de código para la guía
  readonly usageExamples: UsageExample[] = [
    {
      title: 'Uso Básico',
      description: 'El uso más simple con todos los valores por defecto',
      code: '<app-button>Click me</app-button>',
      demo: { variant: 'filled', color: 'primary', label: 'Click me', disabled: false }
    },
    {
      title: 'Cambiar Variante',
      description: 'Personaliza solo la apariencia del botón',
      code: '<app-button variant="outlined">Outlined Button</app-button>',
      demo: { variant: 'outlined', color: 'primary', label: 'Outlined Button', disabled: false }
    },
    {
      title: 'Cambiar Color',
      description: 'Usa diferentes colores del sistema de diseño',
      code: '<app-button color="secondary">Secondary</app-button>',
      demo: { variant: 'filled', color: 'secondary', label: 'Secondary', disabled: false }
    },
    {
      title: 'Con Icono Antes',
      description: 'Agrega un icono antes del texto',
      code: '<app-button iconBefore="save">Save</app-button>',
      demo: { variant: 'filled', color: 'primary', label: 'Save', disabled: false, iconBefore: 'save' }
    },
    {
      title: 'Con Icono Después',
      description: 'Agrega un icono después del texto',
      code: '<app-button iconAfter="arrow_forward">Next</app-button>',
      demo: { variant: 'filled', color: 'primary', label: 'Next', disabled: false, iconAfter: 'arrow_forward' }
    },
    {
      title: 'Botón Deshabilitado',
      description: 'Deshabilita la interacción del botón',
      code: '<app-button [disabled]="true">Disabled</app-button>',
      demo: { variant: 'filled', color: 'primary', label: 'Disabled', disabled: true }
    },
    {
      title: 'Personalización Completa',
      description: 'Combina múltiples propiedades',
      code: '<app-button\n  variant="elevated"\n  color="tertiary"\n  iconBefore="delete">\n  Delete\n</app-button>',
      demo: { variant: 'elevated', color: 'tertiary', label: 'Delete', disabled: false, iconBefore: 'delete' }
    },
    {
      title: 'Formulario Submit',
      description: 'Botón para enviar formularios',
      code: '<app-button type="submit" iconAfter="send">Submit</app-button>',
      demo: { variant: 'filled', color: 'primary', label: 'Submit', disabled: false, iconAfter: 'send' }
    }
  ];

  // Guía de cuándo usar cada variante
  readonly variantGuides: VariantGuide[] = [
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

  goBack(): void {
    this.router.navigate(['/pds/index']);
  }

  setShape(shape: ButtonShape): void {
    this.shape.set(shape);
  }

  setSize(size: ButtonSize): void {
    this.size.set(size);
  }
}
