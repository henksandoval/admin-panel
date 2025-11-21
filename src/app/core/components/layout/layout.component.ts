import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LayoutService } from '../../services/layout.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { SettingsPanelComponent } from '../settings-panel/settings-panel.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    SidebarComponent,
    ToolbarComponent,
    SettingsPanelComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private layoutService = inject(LayoutService);

  protected readonly sidebarOpened = this.layoutService.sidebarOpened;
  protected readonly isMobile = this.layoutService.isMobile;
  protected readonly sidebarCollapsed = this.layoutService.sidebarCollapsed;

  onBackdropClick(): void {
    if (this.isMobile()) {
      this.layoutService.closeSidebar();
    }
  }
}

