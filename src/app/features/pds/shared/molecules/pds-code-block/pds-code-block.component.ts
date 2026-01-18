import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pds-code-block',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  template: `
    <mat-card appearance="outlined" class="code-card overflow-hidden">
      <div class="code-header px-4 py-3 border-b flex justify-between items-center">
        <h3 class="text-sm font-medium flex items-center gap-2">
          <mat-icon class="text-base">code</mat-icon> {{ title }}
        </h3>
        <button
          mat-icon-button
          (click)="copyToClipboard()"
          matTooltip="Copiar código"
          class="scale-75">
          <mat-icon>content_copy</mat-icon>
        </button>
      </div>
      <div class="p-4 relative group">
        <pre class="font-mono text-sm overflow-x-auto"><code>{{ code }}</code></pre>
      </div>
      @if (footer) {
        <div class="code-footer px-4 py-2 text-xs border-t">
          {{ footer }}
        </div>
      }
    </mat-card>
  `,
  styleUrl: 'pds-code-block.component.scss'
})
export class PdsCodeBlockComponent {
  @Input({ required: true }) code!: string;
  @Input() title = 'Generated Code';
  @Input() footer = '💡 Solo incluye las propiedades que difieren de los defaults.';

  private readonly snackBar = inject(MatSnackBar);

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.code).then(() => {
      this.snackBar.open('✅ Código copiado al portapapeles', 'Cerrar', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom'
      });
    });
  }
}
