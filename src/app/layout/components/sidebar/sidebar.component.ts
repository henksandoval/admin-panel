import {Component, inject, input, ChangeDetectionStrategy, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {NavigationItem, NavigationService} from '../../services/navigation.service';
import { LayoutService } from '../../services/layout.service';
import { NavTreeComponent } from './components/nav-tree/nav-tree.component';
import {NavFloatingComponent} from './components/nav-floating/nav-floating.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    NavTreeComponent,
    NavFloatingComponent
  ],
  host: {
    class: 'block h-full bg-gradient-to-b from-theme-600 to-theme-700 dark:from-theme-700 dark:to-theme-800'
  },
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  private navigationService = inject(NavigationService);
  private layoutService = inject(LayoutService);
  private router = inject(Router);

  isExpanded = input<boolean>(true);

  protected activeNavigationItem = signal<NavigationItem | null>(null);
  protected hoveredIconTop = signal<number>(0);
  protected readonly navigation = this.navigationService.getNavigation();

  toggleCollapse(): void {
    this.layoutService.toggleSidebarDisplay();
  }

  protected onIconHover(item: NavigationItem, event: MouseEvent): void {
    if (item.children && item.children.length > 0) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.hoveredIconTop.set(rect.top);
      this.activeNavigationItem.set(item);
    } else if (item.url) {
      void this.router.navigate([item.url]);

      if (this.layoutService.isMobile()) {
        this.layoutService.closeSidebar();
      }
    }
  }

  protected onFloatingNavClosed(): void {
    this.activeNavigationItem.set(null);
  }
}

