import { Component } from '@angular/core';
import { CriticalErrorsPageComponent } from '../shared/critical-errors-page.component';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CriticalErrorsPageComponent],
  template: `
    <app-critical-errors-page
      icon="lock"
      iconColor="warn"
      iconClass="app-error-icon"
      [pageCode]="pageCode"
      [pageTitle]="pageTitle"
      [pageDescription]="pageDescription"
      [buttonText]="returnButtonText"
      buttonRoute="/dashboard"
      dataTestId="unauthorized-page">
    </app-critical-errors-page>
  `,
})
export class UnauthorizedComponent {
  protected readonly pageCode = '403';
  protected readonly pageTitle = $localize`:Unauthorized|Page title@@errors.unauthorized.title:Access denied`;
  protected readonly pageDescription = $localize`:Unauthorized|Page description@@errors.unauthorized.description:You do not have permission to access this resource`;
  protected readonly returnButtonText = $localize`:Unauthorized|Return button@@errors.unauthorized.button:Return to dashboard`;
}
