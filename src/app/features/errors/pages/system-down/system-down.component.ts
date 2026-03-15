import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-system-down',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="app-error-wrapper" data-testid="system-down-page">
      <div class="app-error-container">
        <div class="text-center">
          <mat-icon class="app-error-icon app-system-down-icon" color="warn">build_circle</mat-icon>
          <h1 class="mat-headline-large">{{ pageTitle }}</h1>
          <p class="mat-body-medium mt-4">{{ pageDescription }}</p>
          <div class="mt-8">
            <button mat-raised-button color="primary" (click)="onRetry()" data-testid="system-down-cta">
              {{ retryButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './system-down.component.scss',
})
export class SystemDownComponent {
  protected readonly pageTitle = $localize`:SystemDown|Page title@@errors.systemdown.title:System maintenance`;
  protected readonly pageDescription = $localize`:SystemDown|Page description@@errors.systemdown.description:The system is currently under maintenance. We'll be back online shortly.`;
  protected readonly retryButtonText = $localize`:SystemDown|Retry button@@errors.systemdown.button:Try again`;

  onRetry(): void {
    location.reload();
  }
}
