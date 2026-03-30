import { Component } from '@angular/core';
import { ErrorsPageComponent } from '@features/errors/shared';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [ErrorsPageComponent],
  template: `
    <app-error-page-layout
      icon="error_outline"
      iconColor="warn"
      iconClass="app-error-icon"
      [pageTitle]="pageTitle"
      [pageDescription]="pageDescription"
      [buttonText]="returnButtonText"
      buttonRoute="/dashboard"
      dataTestId="server-error-page">
        <p class="app-server-error-code mat-display-medium">{{ pageCode }}</p>
    </app-error-page-layout>
  `,
})
export class ServerErrorComponent {
  protected readonly pageCode = '500';
  protected readonly pageTitle = $localize`:ServerError|Page title@@errors.servererror.title:Something went wrong`;
  protected readonly pageDescription = $localize`:ServerError|Page description@@errors.servererror.description:An unexpected error has occurred. Our team has been notified`;
  protected readonly returnButtonText = $localize`:ServerError|Return button@@errors.servererror.button:Return to dashboard`;
}
