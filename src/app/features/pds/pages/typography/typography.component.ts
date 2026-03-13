import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AppCardComponent } from '@ui-atoms/app-card';
import { AppPageLayoutComponent } from '@ui-templates/app-page-layout/app-page-layout.component';
import { AppSlotContainerDirective } from '@ui-templates/app-page-layout/app-slot-container.directive';

export interface TypographyEntry {
  matClass: string;
  suggestedTag: string;
  sample: string;
  usage: string;
}

export interface TypographyCategory {
  name: string;
  icon: string;
  description: string;
  entries: TypographyEntry[];
}

const CATEGORIES: TypographyCategory[] = [
  {
    name: 'Display',
    icon: 'title',
    description: 'La escala más grande y expresiva. Reservada para hero sections, landing pages y portadas donde el impacto visual es lo primero.',
    entries: [
      { matClass: 'mat-display-large',  suggestedTag: 'h1',   sample: 'Build something great',  usage: 'Hero de landing page' },
      { matClass: 'mat-display-medium', suggestedTag: 'h1',   sample: 'Build something great',  usage: 'Portada de sección principal' },
      { matClass: 'mat-display-small',  suggestedTag: 'h1',   sample: 'Build something great',  usage: 'Detalle con título prominente' },
    ],
  },
  {
    name: 'Headline',
    icon: 'format_size',
    description: 'Títulos de página y secciones. Expresivos pero más contenidos que Display. Ideales para estructurar jerarquía de contenido.',
    entries: [
      { matClass: 'mat-headline-large',  suggestedTag: 'h1',  sample: 'Galería de componentes',  usage: 'Título principal de página' },
      { matClass: 'mat-headline-medium', suggestedTag: 'h2',  sample: 'Galería de componentes',  usage: 'Título de sección' },
      { matClass: 'mat-headline-small',  suggestedTag: 'h3',  sample: 'Galería de componentes',  usage: 'Subsección o card destacada' },
    ],
  },
  {
    name: 'Title',
    icon: 'text_fields',
    description: 'Encabezados de componentes de media complejidad: toolbars, dialogs, sidebars, cards y panels.',
    entries: [
      { matClass: 'mat-title-large',  suggestedTag: 'h2',  sample: 'Panel de configuración',  usage: 'Dialog, sidebar, settings panel' },
      { matClass: 'mat-title-medium', suggestedTag: 'h3',  sample: 'Panel de configuración',  usage: 'Toolbar, card header' },
      { matClass: 'mat-title-small',  suggestedTag: 'h4',  sample: 'Panel de configuración',  usage: 'Sección compacta, subtítulo' },
    ],
  },
  {
    name: 'Body',
    icon: 'subject',
    description: 'El nivel más usado en la aplicación. Para párrafos, descripciones y todo el contenido textual principal.',
    entries: [
      { matClass: 'mat-body-large',  suggestedTag: 'p',  sample: 'Explora y configura cada componente con controles interactivos en tiempo real.',  usage: 'Texto principal del contenido' },
      { matClass: 'mat-body-medium', suggestedTag: 'p',  sample: 'Explora y configura cada componente con controles interactivos en tiempo real.',  usage: 'Texto secundario, descripciones' },
      { matClass: 'mat-body-small',  suggestedTag: 'p',  sample: 'Explora y configura cada componente con controles interactivos en tiempo real.',  usage: 'Texto de apoyo, captions largas' },
    ],
  },
  {
    name: 'Label',
    icon: 'label_important',
    description: 'Texto compacto de interfaz: botones, chips, tabs, breadcrumbs, form field labels y cualquier elemento de UI.',
    entries: [
      { matClass: 'mat-label-large',  suggestedTag: 'span',  sample: 'Guardar cambios',  usage: 'Botones, labels de input' },
      { matClass: 'mat-label-medium', suggestedTag: 'span',  sample: 'Guardar cambios',  usage: 'Chips, tabs, badges' },
      { matClass: 'mat-label-small',  suggestedTag: 'span',  sample: 'Guardar cambios',  usage: 'Captions, overlines, hints' },
    ],
  },
];

@Component({
  selector: 'app-typography',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    AppCardComponent,
    AppPageLayoutComponent,
    AppSlotContainerDirective,
  ],
  templateUrl: './typography.component.html',
  styleUrl: './typography.component.scss',
})
export default class TypographyComponent {
  readonly categories = CATEGORIES;
}
