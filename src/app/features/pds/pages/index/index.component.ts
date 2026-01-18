import { Component } from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {CommonModule} from "@angular/common";
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-index',
    imports: [
      CommonModule,
      MatCardModule,
      MatButtonModule,
      MatIconModule
    ],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent {
  showcaseItems: ShowcaseItem[] = [
    {
      id: 'forms',
      title: 'Form Fields',
      description: 'Input fields, textareas, and form controls with various appearances and configurations.',
      icon: 'edit_note',
      route: '/pds/forms'
    },
    {
      id: 'buttons',
      title: 'Buttons',
      description: 'Button variants with different styles, colors, sizes and shapes for all use cases.',
      icon: 'smart_button',
      route: '/pds/buttons'
    },
    {
      id: 'checkboxes',
      title: 'Checkboxes',
      description: 'Componente para selección múltiple y opciones binarias siguiendo Material Design 3',
      icon: 'check_box',
      route: '/pds/checkboxes'
    },
    {
      id: 'selects',
      title: 'Selects',
      description: 'Dropdown select fields for single and multiple selection with grouped options support',
      icon: 'arrow_drop_down_circle',
      route: '/pds/selects'
    },
    {
      id: 'toggle-groups',
      title: 'Toggle Groups',
      description: 'Segmented controls for single or multiple selection with icon support',
      icon: 'view_week',
      route: '/pds/toggle-groups'
    },
    {
      id: 'badges',
      title: 'Badges',
      description: 'Componente unificado para badges inline (etiquetas) y overlay (notificaciones)',
      icon: 'label',
      route: '/pds/badges'
    },
    {
      id: 'indicators',
      title: 'Indicadores',
      description: 'Componente para mostrar información de estado o progreso',
      icon: 'edit_note',
      route: '/pds/indicators'
    }
  ];

  constructor(private router: Router) {}

  navigateToShowcase(route: string) {
    this.router.navigate([route]);
  }
}
