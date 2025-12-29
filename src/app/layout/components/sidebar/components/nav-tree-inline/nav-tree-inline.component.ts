import { Component, input, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationItem, NavigationService } from '../../../../services/navigation.service';
import { filter, Subscription } from 'rxjs';
import {LayoutService} from '../../../../services/layout.service';

@Component({
  selector: 'app-nav-tree-inline',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './nav-tree-inline.component.html',
  styleUrl: './nav-tree-inline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavTreeInlineComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private layoutService = inject(LayoutService);
  private navigationService = inject(NavigationService);
  private changeDetector = inject(ChangeDetectorRef);
  private routerSubscription?: Subscription;

  protected readonly data = computed(() => this.navigationService.getCurrentNavigation()());

  protected readonly childrenAccessor = (node: NavigationItem) => node.children ?? [];

  public ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveRootItem();
        this.changeDetector.markForCheck();
      });

    this.updateActiveRootItem();
  }

  public ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  protected navigate(node: NavigationItem): void {
    if (node.url) {
      void this.router.navigate([node.url]);

      if (this.layoutService.isMobile()) {
        this.layoutService.closeSidebar();
      }
    }
  }

  protected hasChild = (_: number, node: NavigationItem) => !!node.children && node.children.length > 0;

  protected isActive(url?: string): boolean {
    if (!url) return false;
    return this.isRouteActive(url);
  }

  protected isParentOfActive(node: NavigationItem): boolean {
    if (!node.children) return false;
    return this.hasActiveChild(node.children);
  }

  protected getTotalBadgeCount(node: NavigationItem): number {
    if (!node.children) {
      return node.badge?.title ? +node.badge.title : 0;
    }

    return node.children.reduce((sum, child) => {
      return sum + this.getTotalBadgeCount(child);
    }, 0);
  }

  private hasActiveChild(children: NavigationItem[]): boolean {
    return children.some(child => {
      if (child.url && this.isRouteActive(child.url)) {
        return true;
      }
      if (child.children) {
        return this.hasActiveChild(child.children);
      }
      return false;
    });
  }

  private isRouteActive(url: string): boolean {
    return this.router.isActive(url, {
      paths: 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  private updateActiveRootItem(): void {
    const data = this.navigationService.getNavigation()();

    for (const rootItem of data) {
      if (this.itemContainsActiveRoute(rootItem)) {
        this.navigationService.setActiveRootItemId(rootItem.id);
        return;
      }
    }

    this.navigationService.setActiveRootItemId(null);
  }

  private itemContainsActiveRoute(item: NavigationItem): boolean {
    if (item.url && this.isRouteActive(item.url)) {
      return true;
    }

    if (item.children && item.children.length > 0) {
      return item.children.some(child => this.itemContainsActiveRoute(child));
    }

    return false;
  }
}
