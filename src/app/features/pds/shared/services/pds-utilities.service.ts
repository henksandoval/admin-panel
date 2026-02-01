import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class PdsUtilitiesService {
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Obtiene las clases CSS para el badge de énfasis
   */
  getEmphasisBadgeClasses(emphasis: 'high' | 'medium' | 'low'): string {
    const classMap = {
      high: 'emphasis-badge high',
      medium: 'emphasis-badge medium',
      low: 'emphasis-badge low'
    };
    return classMap[emphasis];
  }

  /**
   * Obtiene las clases CSS para el borde de la card según énfasis
   */
  getCardBorderClasses(emphasis: 'high' | 'medium' | 'low'): string {
    const classMap = {
      high: 'card-border high',
      medium: 'card-border medium',
      low: 'card-border low'
    };
    return classMap[emphasis];
  }

  /**
   * Copia texto al portapapeles y muestra un snackbar de confirmación
   */
  copyToClipboard(text: string, message: string = '✅ Código copiado al portapapeles'): Promise<void> {
    return navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open(message, 'Cerrar', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom'
      });
    });
  }

  /**
   * Muestra un mensaje de éxito
   */
  showSuccess(message: string, duration: number = 2000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Muestra un mensaje de error
   */
  showError(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Muestra un mensaje informativo
   */
  showInfo(message: string, duration: number = 2000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['info-snackbar']
    });
  }
}
