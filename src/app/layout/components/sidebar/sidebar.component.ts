import {Component, inject, input, ChangeDetectionStrategy, signal, computed, OnInit, effect} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {NavigationItem, NavigationService} from '../../services/navigation.service';
import { LayoutService } from '../../services/layout.service';
import {Router} from '@angular/router';
import {NavTreeInlineComponent} from './components/nav-tree-inline/nav-tree-inline.component';
import {NavTreeFloatingComponent} from './components/nav-tree-floating/nav-tree-floating.component';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    NavTreeInlineComponent,
    NavTreeFloatingComponent
  ],
  host: {
    class: 'block h-full'
  },
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit {
  private navigationService = inject(NavigationService);
  private layoutService = inject(LayoutService);
  private router = inject(Router);

  isExpanded = input<boolean>(true);

  protected hoveredIconTop = signal<number>(0);
  protected readonly showFloatingMenu = computed(() =>
    this.navigationService.getCurrentNavigation()().length > 0
  );
  protected readonly navigation = this.navigationService.getNavigation();
  protected readonly activeRootItemId = this.navigationService.getActiveRootItemId();
  private routerUrl = toSignal(this.router.events);

  constructor() {
    effect(() => {
      this.routerUrl();
      this.navigationService.updateActiveRootItem();
    });
  }

  ngOnInit(): void {
    if (this.layoutService.sidebarExpanded()) {
      const menu = this.navigationService.getNavigation()();
      this.navigationService.setCurrentNavigation(menu);
    }
  }

  protected toggleCollapse(): void {
    this.layoutService.toggleSidebarDisplay();
    this.navigationService.setCurrentNavigation([]);

    if (this.layoutService.sidebarExpanded()) {
      this.navigationService.setCurrentNavigation(this.navigation());
    }
  }

  protected isItemActive(item: NavigationItem): boolean {
    return !!(item.url && this.navigationService.isRouteActive(item.url));
  }

  protected isItemParentActive(item: NavigationItem): boolean {
    if (this.isItemActive(item)) {
      return false;
    }
    return this.activeRootItemId() === item.id;
  }

  protected onIconClick(item: NavigationItem): void {
    if (item.url) {
      void this.router.navigate([item.url]);
    }
  }

  protected onIconHover(item: NavigationItem, event: MouseEvent): void {
    if (!item.children || item.children.length === 0) {
      this.hoveredIconTop.set(0);
      this.navigationService.setCurrentNavigation([]);
      return;
    }

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.hoveredIconTop.set(rect.top);
    this.navigationService.setCurrentNavigation(item.children);
  }

  protected onFloatingNavClosed(): void {
    this.navigationService.setCurrentNavigation([]);
  }
}
