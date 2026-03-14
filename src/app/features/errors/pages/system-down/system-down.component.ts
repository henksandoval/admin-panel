import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-system-down',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="app-system-down-wrapper" data-testid="system-down-page">
      <div class="app-system-down-container">
        <div class="text-center">
          <mat-icon class="app-system-down-icon" color="warn">build_circle</mat-icon>
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
  styles: `
    .app-system-down-wrapper {
      display: flex;
      height: 100vh;
      width: 100vw;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(107, 114, 128, 0.05) 0%, rgba(75, 85, 99, 0.05) 100%);
    }

    .app-system-down-container {
      max-width: 400px;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .app-system-down-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
    }
  `,
})
export class SystemDownComponent {
  protected readonly pageTitle = $localize`:SystemDown|Page title@@errors.systemdown.title:System maintenance`;
  protected readonly pageDescription = $localize`:SystemDown|Page description@@errors.systemdown.description:The system is currently under maintenance. We'll be back online shortly.`;
  protected readonly retryButtonText = $localize`:SystemDown|Retry button@@errors.systemdown.button:Try again`;

  onRetry(): void {
    location.reload();
  }
}
