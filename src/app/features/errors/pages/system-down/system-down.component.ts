import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ErrorsPageComponent } from '@features/errors/shared/templates/error-page-layout/error-page-layout.component';

@Component({
  selector: 'app-system-down',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, ErrorsPageComponent],
  template: `
    <app-error-page-layout
      icon="schedule"
      iconColor="warn"
      iconClass="app-error-icon"
      [pageTitle]="pageTitle"
      [pageDescription]="pageDescription"
      [buttonText]="retryButtonText"
      buttonRoute="/auth/login"
      dataTestId="system-down-page">
    </app-error-page-layout>
  `
})
export class SystemDownComponent {
  protected readonly pageTitle = $localize`:SystemDown|Page title@@errors.systemdown.title:System maintenance`;
  protected readonly pageDescription = $localize`:SystemDown|Page description@@errors.systemdown.description:The system is currently under maintenance. We'll be back online shortly.`;
  protected readonly retryButtonText = $localize`:SystemDown|Retry button@@errors.systemdown.button:Try again`;

  onRetry(): void {
    location.reload();
  }
}
