import { Component } from '@angular/core';
import { ErrorsPageComponent } from '../shared/errors-page.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [ErrorsPageComponent],
  template: `
    <app-errors-page
      icon="search_off"
      iconColor="primary"
      iconClass="app-not-found-icon"
      [pageTitle]="pageTitle"
      [pageDescription]="pageDescription"
      [buttonText]="returnButtonText"
      buttonRoute="/dashboard"
      dataTestId="not-found-page">
      <p class="app-not-found-code mat-display-medium">{{ pageCode }}</p>
    </app-errors-page>
  `,
})
export class NotFoundComponent {
  protected readonly pageCode = '404';
  protected readonly pageTitle = $localize`:NotFound|Page title@@errors.notfound.title:Page not found`;
  protected readonly pageDescription = $localize`:NotFound|Page description@@errors.notfound.description:The page you are looking for does not exist or has been moved`;
  protected readonly returnButtonText = $localize`:NotFound|Return button@@errors.notfound.button:Return to dashboard`;
}
