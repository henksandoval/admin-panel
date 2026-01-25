import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pds-code-block',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  template: `
    <mat-expansion-panel 
      [expanded]="expanded"
      [hideToggle]="hideToggle"
      [disabled]="disabled"
      class="code-expansion-panel">
      <mat-expansion-panel-header>
        <mat-panel-title>
          <div class="flex items-center gap-2">
            <mat-icon class="text-base">code</mat-icon>
            <span class="text-sm font-medium">{{ title }}</span>
          </div>
        </mat-panel-title>
        <mat-panel-description>
          <button
            mat-icon-button
            (click)="copyToClipboard(); $event.stopPropagation()"
            matTooltip="Copiar código"
            class="scale-75">
            <mat-icon>content_copy</mat-icon>
          </button>
        </mat-panel-description>
      </mat-expansion-panel-header>
      
      <div class="p-4">
        <pre class="font-mono text-sm overflow-x-auto"><code>{{ code }}</code></pre>
      </div>
      
      @if (footer) {
        <div class="code-footer px-4 py-2 text-xs border-t">
          {{ footer }}
        </div>
      }
    </mat-expansion-panel>
  `,
  styleUrl: 'pds-code-block.component.scss'
})
export class PdsCodeBlockComponent {
  @Input({ required: true }) code!: string;
  @Input() title = 'Generated Code';
  @Input() footer = '💡 Solo incluye las propiedades que difieren de los defaults.';
  
  @Input() expanded = false;
  @Input() hideToggle = false;
  @Input() disabled = false;

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
