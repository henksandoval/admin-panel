import { Component } from '@angular/core';
import { ErrorsPageComponent } from '@features/errors/shared/templates/error-page-layout/error-page-layout.component';
import { APP_PATHS } from '@core/models/app-routes.model';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [ErrorsPageComponent],
  template: `
    <app-error-page-layout
      icon="search_off"
      iconColor="primary"
      iconClass="app-error-icon"
      [pageTitle]="pageTitle"
      [pageDescription]="pageDescription"
      [buttonText]="returnButtonText"
      [buttonRoute]="dashboardRoute"
      dataTestId="not-found-page">
      <p class="app-not-found-code mat-display-medium">{{ pageCode }}</p>
    </app-error-page-layout>
  `,
})
export class NotFoundComponent {
  protected readonly dashboardRoute = APP_PATHS.dashboard;
  protected readonly pageCode = '404';
  protected readonly pageTitle = $localize`:NotFound|Page title@@errors.notfound.title:Page not found`;
  protected readonly pageDescription = $localize`:NotFound|Page description@@errors.notfound.description:The page you are looking for does not exist or has been moved`;
  protected readonly returnButtonText = $localize`:NotFound|Return button@@errors.notfound.button:Return to dashboard`;
}
