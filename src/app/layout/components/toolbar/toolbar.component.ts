import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { LayoutService } from '../../services/layout.service';
import { AppBreadCrumbComponent } from '@ui-molecules/app-bread-crumb';
import { AuthService } from '@auth/services';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    AppBreadCrumbComponent
  ],
  templateUrl: './toolbar.component.html',
  styles: `
    .toolbar {
      height: var(--toolbar-height);
      padding-inline: 1rem;
      position: sticky;
      top: 0;
      z-index: var(--z-toolbar);
      animation: toolbar-compact linear both;
      animation-timeline: scroll(nearest);
      animation-range: 4px 48px;
    }

    @keyframes toolbar-compact {
      from {
        height: var(--toolbar-height);
        box-shadow: 0 1px 0 var(--overlay-shadow-10);
      }
      to {
        height: 48px;
        box-shadow: 0 4px 24px var(--overlay-shadow-20);
      }
    }

    .toolbar-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .menu-header {
      padding: 0.75rem 1rem;
    }

    .menu-header-title {
      font-weight: 600;
      margin: 0;
    }

    .menu-header-subtitle {
      margin: 0;
      opacity: 0.7;
    }

    .menu-item-text {
    }

    .menu-divider {
      margin-block: 0.5rem;
    }
  `
})
export class ToolbarComponent {
  private readonly layoutService = inject(LayoutService);
  private readonly authService   = inject(AuthService);

  readonly currentUser = this.authService.currentUser;

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}

