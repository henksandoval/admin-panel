import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-session-expired',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="app-session-expired-wrapper">
      <div class="app-session-expired-container">
        <div class="text-center">
          <mat-icon class="app-session-expired-icon" color="warn">schedule</mat-icon>
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
    .app-session-expired-wrapper {
      display: flex;
      height: 100vh;
      width: 100vw;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    }

    .app-session-expired-container {
      max-width: 400px;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .app-session-expired-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
    }
  `,
})
export class SessionExpiredComponent {
  protected readonly pageTitle = $localize`:SessionExpired|Page title@@errors.sessionexpired.title:Session expired`;
  protected readonly pageDescription = $localize`:SessionExpired|Page description@@errors.sessionexpired.description:Your session has expired for security reasons. Please log in again.`;
  protected readonly loginButtonText = $localize`:SessionExpired|Login button@@errors.sessionexpired.button:Go to login`;
}
