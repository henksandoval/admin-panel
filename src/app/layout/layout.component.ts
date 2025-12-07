import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LayoutService } from './services/layout.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SettingsPanelComponent } from './components/settings-panel/settings-panel.component';

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
  template: `
    <div class="layout-container">
      <mat-sidenav-container class="sidenav-container" autosize>
        <mat-sidenav
          #sidenav
          [mode]="isMobile() ? 'over' : 'side'"
          [opened]="sidebarOpened()"
          [fixedInViewport]="isMobile()"
          [fixedTopGap]="0"
          [fixedBottomGap]="0"
          (backdropClick)="onBackdropClick()"
          [class.collapsed]="sidebarCollapsed()"
          class="sidenav">
          <app-sidebar [collapsed]="sidebarCollapsed()"></app-sidebar>
        </mat-sidenav>

        <mat-sidenav-content class="sidenav-content">
          <app-toolbar></app-toolbar>
          <main class="main-content bg-gray-50">
            <div class="content-wrapper">
              <router-outlet></router-outlet>
            </div>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>

      <app-settings-panel></app-settings-panel>
    </div>
  `,
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

