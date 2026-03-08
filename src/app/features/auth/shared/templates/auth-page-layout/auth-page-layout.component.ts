import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'auth-page-layout',
  standalone: true,
  imports: [MatIconModule],
  styleUrl: './auth-page-layout.component.scss',
  template: `
    <div class="auth-page-layout__header">
      <div class="auth-page-layout__header-inner flex items-end justify-between">
        <div class="auth-page-layout__brand flex flex-col items-start pb-4 pl-8">
          <span class="auth-page-layout__brand-name">Admin</span>
          <span class="auth-page-layout__brand-sub mat-body-medium">Panel</span>
        </div>
      </div>
      <div class="auth-page-layout__header-accent"></div>
    </div>
    <div class="auth-page-layout__card">
      <ng-content/>
    </div>
  `,
})
export class AuthPageLayoutComponent {
}
