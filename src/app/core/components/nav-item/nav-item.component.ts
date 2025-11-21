import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { NavigationItem } from '../../services/navigation.service';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatRippleModule
  ],
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss'
})
export class NavItemComponent {
  item = input.required<NavigationItem>();
  level = input<number>(0);

  protected readonly isOpen = signal(false);

  constructor(private layoutService: LayoutService) {}

  toggleCollapse(): void {
    if (this.item().type === 'collapsable') {
      this.isOpen.set(!this.isOpen());
    }
  }

  onItemClick(): void {
    // Si es un item con URL y estamos en móvil, cerrar el sidebar
    if (this.item().type === 'item' && this.layoutService.isMobile()) {
      this.layoutService.closeSidebar();
    }
  }

  getIndentClass(): string {
    const level = this.level();
    if (level === 0) return '';
    return `pl-${level * 4}`;
  }

  getPaddingLeft(): string {
    const level = this.level();
    return `${level * 16 + 16}px`;
  }
}

