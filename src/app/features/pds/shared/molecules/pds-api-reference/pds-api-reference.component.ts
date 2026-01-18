import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {PdsApiReferencePropertyModel} from './pds-api-reference-property.model';

@Component({
  selector: 'app-pds-api-reference',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <section class="mt-12 pt-12 section-divider border-t-2">
      <div class="api-section-header flex items-center gap-3 mb-8">
        <div class="api-icon-container p-3 rounded-xl border">
          <mat-icon class="block">settings</mat-icon>
        </div>
        <div>
          <h2 class="api-title text-3xl font-bold">{{ title }}</h2>
          <p class="api-description">
            {{ description }}
            <code class="inline-code px-1.5 py-0.5 rounded text-sm font-mono border">{{ componentTag }}</code>
          </p>
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
            <div class="api-type text-xs font-mono p-2.5 rounded-lg break-words border">
              {{ prop.type }}
            </div>
            @if (prop.defaultValue) {
              <div class="mt-3 inline-block api-default text-xs font-semibold px-2.5 py-1 rounded-full border"
                   [class.optional]="prop.optional">
                {{ prop.optional ? 'Optional' : 'Default: ' + prop.defaultValue }}
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .section-divider {
      border-color: var(--mat-sys-outline-variant);
    }

    .api-section-header {
      .api-icon-container {
        background: linear-gradient(
          135deg,
          var(--mat-sys-primary-container),
          var(--mat-sys-tertiary-container)
        );
        border-color: var(--mat-sys-primary);

        mat-icon {
          color: var(--mat-sys-primary);
        }
      }

      .api-title {
        color: var(--mat-sys-on-surface);
      }

      .api-description {
        color: var(--mat-sys-on-surface-variant);
      }
    }

    .inline-code {
      background-color: var(--mat-sys-surface-container);
      color: var(--mat-sys-on-surface);
      border-color: var(--mat-sys-outline-variant);
    }

    .api-card {
      background-color: var(--mat-sys-surface);
      border-color: var(--mat-sys-outline);
      border-width: 2px;
      transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        border-color: var(--mat-sys-primary);
        box-shadow: 0 8px 24px var(--overlay-shadow-15);
        transform: translateY(-2px);
      }
    }

    .api-property {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      font-weight: 600;
    }

    .api-decorator {
      background-color: var(--mat-sys-surface-container-low);
      color: var(--mat-sys-on-surface-variant);
    }

    .api-description-text {
      color: var(--mat-sys-on-surface-variant);
    }

    .api-type {
      background-color: var(--mat-sys-surface-container-low);
      color: var(--mat-sys-on-surface-variant);
      border-color: var(--mat-sys-outline-variant);
    }

    .api-default {
      background-color: var(--mat-sys-tertiary-container);
      color: var(--mat-sys-on-tertiary-container);
      border-color: var(--mat-sys-tertiary);

      &.optional {
        background-color: var(--mat-sys-surface-container);
        color: var(--mat-sys-on-surface-variant);
        border-color: var(--mat-sys-outline-variant);
      }
    }
  `]
})
export class PdsApiReferenceComponent {
  @Input() title = 'API Reference';
  @Input() description = 'Documentación completa de propiedades disponibles en';
  @Input({ required: true }) componentTag!: string;
  @Input({ required: true }) properties!: PdsApiReferencePropertyModel[];
}
