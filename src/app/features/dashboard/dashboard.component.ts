import { Component } from '@angular/core';
import { HasPermissionDirective } from '@auth/directives/has-permission.directive';
import { HasRoleDirective } from '@auth/directives/has-role.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HasPermissionDirective, HasRoleDirective],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
}

