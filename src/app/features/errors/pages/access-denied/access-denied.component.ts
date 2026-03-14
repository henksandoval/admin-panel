import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="app-access-denied-wrapper">
      <div class="app-access-denied-container">
        <div class="text-center">
          <mat-icon class="app-access-denied-icon" color="warn">security</mat-icon>
          <h1 class="mat-headline-large">{{ pageTitle }}</h1>
          <p class="mat-body-medium mt-4">{{ pageDescription }}</p>
          <div class="mt-8">
            <a mat-raised-button color="primary" routerLink="/auth/login">
              {{ loginButtonText }}
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .app-access-denied-wrapper {
      display: flex;
      height: 100vh;
      width: 100vw;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%);
    }

    .app-access-denied-container {
      max-width: 400px;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .app-access-denied-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
    }
  `,
})
export class AccessDeniedComponent {
  protected readonly pageTitle = $localize`:AccessDenied|Page title@@errors.accessdenied.title:Access denied`;
  protected readonly pageDescription = $localize`:AccessDenied|Page description@@errors.accessdenied.description:You do not have authorization to access this resource. Please contact your administrator.`;
  protected readonly loginButtonText = $localize`:AccessDenied|Login button@@errors.accessdenied.button:Go to login`;
}
