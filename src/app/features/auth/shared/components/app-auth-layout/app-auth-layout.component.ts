import { Component, input, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AUTH_LAYOUT_DEFAULTS } from './app-auth-layout.component.model';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [MatIconModule],
  styleUrl: './app-auth-layout.component.scss',
  template: `
    <div class="app-auth-layout__header">
      <div class="app-auth-layout__header-inner flex items-end justify-between">
        <div class="app-auth-layout__brand flex flex-col items-start pb-4 pl-8">
          <span class="app-auth-layout__brand-name">Admin</span>
          <span class="app-auth-layout__brand-sub mat-body-medium">Panel</span>
        </div>
      </div>
      <div class="app-auth-layout__header-accent"></div>
    </div>
    <div class="app-auth-layout__card">
      <ng-content/>
    </div>
  `,
})
export class AppAuthLayoutComponent {
}
