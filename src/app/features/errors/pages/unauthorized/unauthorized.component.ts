import { Component } from '@angular/core';
import { ErrorsPageComponent } from '@features/errors/shared';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [ErrorsPageComponent],
  template: `
    <app-error-page-layout
      icon="lock"
      iconColor="warn"
      iconClass="app-error-icon"
      [pageTitle]="pageTitle"
      [pageDescription]="pageDescription"
      [buttonText]="returnButtonText"
      buttonRoute="/dashboard"
      dataTestId="unauthorized-page">
        <p class="app-not-found-code mat-display-medium">{{ pageCode }}</p>
    </app-error-page-layout>
  `,
})
export class UnauthorizedComponent {
  protected readonly pageCode = '403';
  protected readonly pageTitle = $localize`:Unauthorized|Page title@@errors.unauthorized.title:Access denied`;
  protected readonly pageDescription = $localize`:Unauthorized|Page description@@errors.unauthorized.description:You do not have permission to access this resource`;
  protected readonly returnButtonText = $localize`:Unauthorized|Return button@@errors.unauthorized.button:Return to dashboard`;
}
