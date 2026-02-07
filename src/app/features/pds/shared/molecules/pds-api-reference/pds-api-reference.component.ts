import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {PdsApiReferencePropertyModel} from './pds-api-reference-property.model';

@Component({
  selector: 'app-pds-api-reference',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <section class="api-reference">
    <div class="api-section-header">
      <div class="api-section-header-row">
        <div class="api-icon-container">
          <mat-icon class="api-icon">data_object</mat-icon>
        </div>
        <div>
          <h2 class="api-title">API Reference</h2>
          <p class="api-subtitle">
            Propiedades disponibles para
            <code class="inline-code">{{ componentTag }}</code>
          </p>
        </div>
      </div>
    </div>

    <div class="api-grid">
      @for (prop of properties; track prop.name) {
        <div class="api-card">
          <div class="api-card-header">
            <code class="api-property">{{ prop.name }}</code>
            <span class="api-decorator">{{ prop.decorator }}</span>
          </div>
          <p class="api-description-text">{{ prop.description }}</p>
          <div class="api-meta">
            <div class="api-meta-row">
              <span class="api-label">Type:</span>
              <code class="api-type">{{ prop.type }}</code>
            </div>
            @if (prop.defaultValue) {
              <div class="api-meta-row">
                <span class="api-label">Default:</span>
                <code class="api-default">{{ prop.defaultValue }}</code>
              </div>
            }
            @if (prop.optional) {
              <span class="api-optional-badge">OPTIONAL</span>
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
