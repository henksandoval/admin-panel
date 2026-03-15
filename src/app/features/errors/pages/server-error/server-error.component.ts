import { Component } from '@angular/core';
import { CriticalErrorsPageComponent } from '../shared/critical-errors-page.component';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [CriticalErrorsPageComponent],
  template: `
    <app-critical-errors-page
      icon="error_outline"
      iconColor="warn"
      iconClass="app-error-icon"
      [pageCode]="pageCode"
      [pageTitle]="pageTitle"
      [pageDescription]="pageDescription"
      [buttonText]="returnButtonText"
      buttonRoute="/dashboard"
      dataTestId="server-error-page">
    </app-critical-errors-page>
  `,
})
export class ServerErrorComponent {
  protected readonly pageCode = '500';
  protected readonly pageTitle = $localize`:ServerError|Page title@@errors.servererror.title:Something went wrong`;
  protected readonly pageDescription = $localize`:ServerError|Page description@@errors.servererror.description:An unexpected error has occurred. Our team has been notified`;
  protected readonly returnButtonText = $localize`:ServerError|Return button@@errors.servererror.button:Return to dashboard`;
}
