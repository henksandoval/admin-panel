import { Component, input } from '@angular/core';
import { Highlight } from 'ngx-highlightjs';

@Component({
  selector: 'app-pds-code-block',
  standalone: true,
  imports: [Highlight],
  template: `
    <div class="code-block">
      <pre class="code-block-pre">
        <code [highlight]="code()" [language]="language()"></code>
      </pre>

      @if (footer()) {
        <footer class="code-block-footer">{{ footer() }}</footer>
      }
    </div>
  `,
  styleUrl: './pds-code-block.component.scss',
})
export class PdsCodeBlockComponent {
  readonly code = input.required<string>();
  readonly language = input('xml');
  readonly footer = input('💡 Solo incluye las propiedades que difieren de los defaults.');
}