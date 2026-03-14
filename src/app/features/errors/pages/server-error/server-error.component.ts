import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="app-server-error-container max-w-md mx-auto py-12">
      <div class="text-center">
        <mat-icon class="app-server-error-icon inline-block mb-4" color="warn">error_outline</mat-icon>
        <h1 class="mat-headline-large">{{ pageTitle }}</h1>
        <p class="mat-body-medium mt-4 text-gray-600">{{ pageDescription }}</p>
        <div class="mt-8">
          <a mat-raised-button color="primary" routerLink="/dashboard">
            {{ returnButtonText }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .app-server-error-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
    }
  `,
})
export class ServerErrorComponent {
  protected readonly pageTitle = $localize`:ServerError|Page title@@errors.servererror.title:Something went wrong`;
  protected readonly pageDescription = $localize`:ServerError|Page description@@errors.servererror.description:An unexpected error has occurred. Our team has been notified`;
  protected readonly returnButtonText = $localize`:ServerError|Return button@@errors.servererror.button:Return to dashboard`;
}
