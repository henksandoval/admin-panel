import { Component } from '@angular/core';
import { ErrorsPageComponent } from "@features/errors/shared/templates/error-page-layout/error-page-layout.component";
import { APP_PATHS } from '@core/models/app-routes.model';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [ErrorsPageComponent],
  template: `
    <app-error-page-layout
      icon="security"
      iconColor="warn"
      iconClass="app-error-icon"
      [pageTitle]="pageTitle"
      [pageDescription]="pageDescription"
      [buttonText]="loginButtonText"
      [buttonRoute]="loginRoute"
      dataTestId="access-denied-page">
    </app-error-page-layout>
  `,
})
export class AccessDeniedComponent {
  protected readonly loginRoute = APP_PATHS.auth.login;
  protected readonly pageTitle = $localize`:AccessDenied|Page title@@errors.accessdenied.title:Access denied`;
  protected readonly pageDescription = $localize`:AccessDenied|Page description@@errors.accessdenied.description:You do not have authorization to access this resource. Please contact your administrator.`;
  protected readonly loginButtonText = $localize`:AccessDenied|Login button@@errors.accessdenied.button:Go to login`;
}
