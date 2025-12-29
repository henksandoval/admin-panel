import { Component, input, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationItem } from '../../services/navigation.service';
import { LayoutService } from '../../services/layout.service';
import { filter, Subscription } from 'rxjs';

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
export class NavTreeComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private layoutService = inject(LayoutService);
  private changeDetector = inject(ChangeDetectorRef);
  private routerSubscription?: Subscription;

  dataSource = input.required<NavigationItem[]>();

  protected readonly childrenAccessor = (node: NavigationItem) => node.children ?? [];

  public ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.changeDetector.markForCheck();
      });
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
}
