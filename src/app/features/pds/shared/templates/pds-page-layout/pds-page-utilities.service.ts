import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class PdsPageUtilitiesService {
  private readonly snackBar = inject(MatSnackBar);

  getEmphasisBadgeClasses(emphasis: 'high' | 'medium' | 'low'): string {
    const classMap = {
      high: 'emphasis-badge high',
      medium: 'emphasis-badge medium',
      low: 'emphasis-badge low'
    };
    return classMap[emphasis];
  }

  getCardBorderClasses(emphasis: 'high' | 'medium' | 'low'): string {
    const classMap = {
      high: 'card-border high',
      medium: 'card-border medium',
      low: 'card-border low'
    };
    return classMap[emphasis];
  }

  copyToClipboard(text: string, message = '✅ Código copiado al portapapeles'): Promise<void> {
    return navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open(message, 'Cerrar', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom'
      });
    });
  }

  showSuccess(message: string, duration = 2000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }

  showInfo(message: string, duration = 2000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['info-snackbar']
    });
  }
}
