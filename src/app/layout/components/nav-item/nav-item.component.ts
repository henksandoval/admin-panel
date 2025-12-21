import {Component, inject, input, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatRippleModule,
    MatTooltipModule
  ],
  host: {
    class: 'block'
  },
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss'
})
export class NavItemComponent {
  item = input.required<NavigationItem>();
  level = input<number>(0);
  sidebarCollapsed = input<boolean>(false);
  inFloatingSubmenu = input<boolean>(false);

  protected readonly isOpen = signal(false);
  protected readonly showSubmenu = signal(false);
  protected readonly hoveringSubmenu = signal(false);
  protected readonly submenuPosition = signal<{top: number, left: number}>({top: 0, left: 0});

  private readonly router: Router = inject(Router);
  private readonly layoutService: LayoutService = inject(LayoutService);

  toggleCollapse(): void {
    if (this.item().type === 'collapsable' && !this.sidebarCollapsed()) {
      this.isOpen.set(!this.isOpen());
    }
  }

  onItemClick(): void {
    if (this.item().type === 'item' && this.layoutService.isMobile()) {
      this.layoutService.closeSidebar();
    }
  }

  onMouseEnter(event?: MouseEvent): void {
    if (this.sidebarCollapsed() && this.item().type === 'collapsable' && this.level() === 0) {
      this.showSubmenu.set(true);
      // Calculate position for fixed positioning
      if (event?.currentTarget) {
        const element = event.currentTarget as HTMLElement;
        const rect = element.getBoundingClientRect();
        this.submenuPosition.set({
          top: rect.top,
          left: rect.right + 8
        });
      }
    }
  }

  onMouseLeave(): void {
    if (this.sidebarCollapsed()) {
      setTimeout(() => {
        if (!this.isHoveringSubmenu()) {
          this.showSubmenu.set(false);
        }
      }, 100);
    }
  }

  onSubmenuMouseEnter(): void {
    this.hoveringSubmenu.set(true);
  }

  onSubmenuMouseLeave(): void {
    this.hoveringSubmenu.set(false);
    this.showSubmenu.set(false);
  }

  private isHoveringSubmenu(): boolean {
    return this.hoveringSubmenu();
  }

  getPaddingLeft(): string {
    const level = this.level();
    return `${level * 16 + 16}px`;
  }

  getTooltipText(): string {
    return this.item().title;
  }

  isInActivePath(): boolean {
    if (this.item().type !== 'collapsable') {
      return false;
    }

    return this.getActiveChildDepth(this.item()) > 0;
  }

  getActivePathDepth(): number {
    if (this.item().type !== 'collapsable') {
      return 0;
    }

    return this.getActiveChildDepth(this.item());
  }

  private getActiveChildDepth(item: NavigationItem): number {
    if (!item.children || item.children.length === 0) {
      return 0;
    }

    for (const child of item.children) {
      if (child.type === 'item' && child.url) {
        if (this.router.isActive(child.url, false)) {
          return 1;
        }
      }

      if (child.type === 'collapsable') {
        const childDepth = this.getActiveChildDepth(child);
        if (childDepth > 0) {
          return childDepth + 1;
        }
      }
    }

    return 0;
  }
}
