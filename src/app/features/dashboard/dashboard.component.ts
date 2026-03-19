import { Component } from '@angular/core';
import { HasPermissionDirective } from '@auth/directives/has-permission.directive';
import { HasRoleDirective } from '@auth/directives/has-role.directive';
import { FeatureFlagDirective } from '@core/directives/feature-flag.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HasPermissionDirective, HasRoleDirective, FeatureFlagDirective],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
}

