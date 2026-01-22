import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {PdsApiReferencePropertyModel} from './pds-api-reference-property.model';

@Component({
  selector: 'app-pds-api-reference',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <section class="space-y-4 pt-4" style="border-top: 1px solid var(--mat-sys-outline-variant);">
      <div class="api-section-header mb-6">
        <div class="flex items-center gap-4">
          <div class="api-icon-container p-3 rounded-lg border-2">
            <mat-icon class="text-2xl">data_object</mat-icon>
          </div>
          <div>
            <h2 class="api-title text-2xl font-bold mb-1">API Reference</h2>
            <p class="api-description text-sm">
              Propiedades disponibles para
              <code class="inline-code px-1.5 py-0.5 rounded text-sm font-mono border">{{ componentTag }}</code>
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (prop of properties; track prop.name) {
          <div class="api-card p-5 rounded-xl border-2">
            <div class="flex justify-between items-start mb-3">
              <code class="api-property px-2.5 py-1.5 rounded-lg text-sm">{{ prop.name }}</code>
              <span class="api-decorator text-xs font-mono px-2 py-1 rounded">{{ prop.decorator }}</span>
            </div>
            <p class="api-description-text text-sm mb-3 leading-relaxed">{{ prop.description }}</p>
            <div class="space-y-2 text-xs">
              <div class="flex items-start gap-2">
                <span class="api-label font-bold">Type:</span>
                <code class="api-type flex-1 font-mono">{{ prop.type }}</code>
              </div>
              @if (prop.defaultValue) {
                <div class="flex items-start gap-2">
                  <span class="api-label font-bold">Default:</span>
                  <code class="api-default flex-1 font-mono">{{ prop.defaultValue }}</code>
                </div>
              }
              @if (prop.optional) {
                <span class="api-optional-badge px-2 py-0.5 rounded text-xs font-bold">OPTIONAL</span>
              }
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styleUrl: 'pds-api-reference.component.scss'
})
export class PdsApiReferenceComponent {
  @Input() title = 'API Reference';
  @Input() description = 'Documentación completa de propiedades disponibles en';
  @Input({ required: true }) componentTag!: string;
  @Input({ required: true }) properties!: PdsApiReferencePropertyModel[];
}
