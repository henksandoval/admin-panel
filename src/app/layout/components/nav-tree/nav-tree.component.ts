import { Component, input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationItem } from '../../services/navigation.service';
import { LayoutService } from '../../services/layout.service';
@Component({
  selector: 'app-nav-tree',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './nav-tree.component.html',
  styleUrl: './nav-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavTreeComponent {
  private router = inject(Router);
  private layoutService = inject(LayoutService);
  dataSource = input.required<NavigationItem[]>();
  collapsed = input<boolean>(false);
  protected readonly childrenAccessor = (node: NavigationItem) => node.children ?? [];
  hasChild = (_: number, node: NavigationItem) => !!node.children && node.children.length > 0;
  isActive(url?: string): boolean {
    if (!url) return false;
    return this.router.isActive(url, false);
  }
  navigate(node: NavigationItem): void {
    if (node.url) {
      this.router.navigate([node.url]);
      if (this.layoutService.isMobile()) {
        this.layoutService.closeSidebar();
      }
    }
  }
}
