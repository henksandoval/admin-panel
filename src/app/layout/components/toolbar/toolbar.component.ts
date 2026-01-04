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
      position: relative;
      z-index: var(--z-toolbar);
      transition: all var(--transition-slow);
      box-shadow: 0 2px 4px var(--overlay-shadow-10);
    }
  `
})
export class ToolbarComponent {
  private layoutService = inject(LayoutService);

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }
}

