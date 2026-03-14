import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  styles: `
    .app-server-error-container {
      text-align: center;
      max-width: 500px;
    }

    .app-server-error-code {
      font-size: 8rem;
      font-weight: 300;
      line-height: 1;
      margin-bottom: 1rem;
    }

    .app-server-error-icon {
      font-size: 6rem;
      width: 6rem;
      height: 6rem;
      margin: 0 auto 2rem;
    }
  `,
  template: `
    <div class="app-server-error-container">
      <div class="app-server-error-code">500</div>
      <mat-icon class="app-server-error-icon" color="warn">error_outline</mat-icon>
      <h1 class="mat-headline-large">{{ pageTitle }}</h1>
      <p class="mat-body-medium mt-4">{{ pageDescription }}</p>
      <div class="mt-8 flex gap-4 justify-center">
        <a mat-raised-button color="primary" routerLink="/dashboard">
          {{ returnButtonText }}
        </a>
      </div>
    </div>
  `,
})
export class ServerErrorComponent {
  protected readonly pageTitle = $localize`:ServerError|Page title@@errors.servererror.title:Something went wrong`;
  protected readonly pageDescription = $localize`:ServerError|Page description@@errors.servererror.description:An unexpected error has occurred. Our team has been notified`;
  protected readonly returnButtonText = $localize`:ServerError|Return button@@errors.servererror.button:Return to dashboard`;
}
