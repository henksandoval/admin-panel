import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { LayoutService } from '../../services/layout.service';

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
    MatDividerModule
  ],
  templateUrl: './toolbar.component.html',
  styles: `
    .toolbar {
      height: var(--toolbar-height);
      padding-inline: 1rem;
      position: relative;
      z-index: var(--z-toolbar);
      transition: all var(--transition-slow);
      box-shadow: 0 2px 10px var(--overlay-shadow-15);
    }

    .toolbar-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }

    .toolbar-title-area {
      flex: 1;
    }

    .toolbar-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
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
      font-size: 0.875rem;
      font-weight: 600;
      margin: 0;
    }

    .menu-header-subtitle {
      font-size: 0.75rem;
      margin: 0;
      opacity: 0.7;
    }

    .menu-item-text {
      font-size: 0.875rem;
    }

    .menu-divider {
      margin-block: 0.5rem;
    }
  `
})
export class ToolbarComponent {
  private layoutService = inject(LayoutService);

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }
}

