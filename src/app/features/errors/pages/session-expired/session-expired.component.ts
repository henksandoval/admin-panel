import { Component } from '@angular/core';
import { ErrorsPageComponent } from '../shared/errors-page.component';

@Component({
  selector: 'app-session-expired',
  standalone: true,
  imports: [ErrorsPageComponent],
  template: `
    <app-errors-page
      icon="schedule"
      iconColor="warn"
      iconClass="app-error-icon"
      [pageTitle]="pageTitle"
      [pageDescription]="pageDescription"
      [buttonText]="loginButtonText"
      buttonRoute="/auth/login"
      dataTestId="session-expired-page">
    </app-errors-page>
  `,
})
export class SessionExpiredComponent {
  protected readonly pageTitle = $localize`:SessionExpired|Page title@@errors.sessionexpired.title:Session expired`;
  protected readonly pageDescription = $localize`:SessionExpired|Page description@@errors.sessionexpired.description:Your session has expired for security reasons. Please log in again.`;
  protected readonly loginButtonText = $localize`:SessionExpired|Login button@@errors.sessionexpired.button:Go to login`;
}
