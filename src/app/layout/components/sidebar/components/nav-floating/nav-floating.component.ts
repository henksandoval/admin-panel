import { Component, input, output, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NavigationItem } from '../../../../services/navigation.service';
import { LayoutService } from '../../../../services/layout.service';

@Component({
  selector: 'app-nav-floating',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './nav-floating.component.html',
  styleUrl: './nav-floating.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavFloatingComponent {
  private router = inject(Router);
  private layoutService = inject(LayoutService);

  items = input.required<NavigationItem[]>();
  topPosition = input<number>(0);

  closed = output<void>();

  protected expandedItems = signal<Set<string>>(new Set());

  protected onMouseLeave(): void {
    this.closed.emit();
  }

  protected handleItemClick(item: NavigationItem): void {
    if (this.hasChildren(item)) {
      this.toggleExpand(item.id);
    } else if (item.url) {
      this.navigate(item);
    }
  }

  protected toggleExpand(itemId: string): void {
    const expanded = new Set(this.expandedItems());
    if (expanded.has(itemId)) {
      expanded.delete(itemId);
    } else {
      expanded.add(itemId);
    }
    this.expandedItems.set(expanded);
  }

  protected navigate(item: NavigationItem): void {
    if (item.url) {
      void this.router.navigate([item.url]);

      if (this.layoutService.isMobile()) {
        this.layoutService.closeSidebar();
      }
    }
  }

  protected hasChildren(item: NavigationItem): boolean {
    return !!item.children && item.children.length > 0;
  }

  protected isExpanded(itemId: string): boolean {
    return this.expandedItems().has(itemId);
  }

  protected isActive(url?: string): boolean {
    if (!url) return false;
    return this.router.isActive(url, {
      paths: 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }
}

