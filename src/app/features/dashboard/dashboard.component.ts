import { Component } from '@angular/core';
import { HasPermissionDirective, HasRoleDirective } from '@core/auth/directives';
import { FeatureFlagDirective } from '@core/feature-flags';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HasPermissionDirective, HasRoleDirective, FeatureFlagDirective],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
}
