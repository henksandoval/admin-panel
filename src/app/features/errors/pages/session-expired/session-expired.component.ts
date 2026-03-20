import { Component } from '@angular/core';
import { ErrorsPageComponent } from "@features/errors/shared/templates/error-page-layout/error-page-layout.component";
import { APP_PATHS } from '@core/models/app-routes.model';

@Component({
  selector: 'app-session-expired',
  standalone: true,
  imports: [ErrorsPageComponent],
  template: `
    <app-error-page-layout
      icon="schedule"
      iconColor="warn"
      iconClass="app-error-icon"
      [pageTitle]="pageTitle"
      [pageDescription]="pageDescription"
      [buttonText]="loginButtonText"
      [buttonRoute]="loginRoute"
      dataTestId="session-expired-page">
    </app-error-page-layout>
  `,
})
export class SessionExpiredComponent {
  protected readonly loginRoute = APP_PATHS.auth.login;
  protected readonly pageTitle = $localize`:SessionExpired|Page title@@errors.sessionexpired.title:Session expired`;
  protected readonly pageDescription = $localize`:SessionExpired|Page description@@errors.sessionexpired.description:Your session has expired for security reasons. Please log in again.`;
  protected readonly loginButtonText = $localize`:SessionExpired|Login button@@errors.sessionexpired.button:Go to login`;
}
