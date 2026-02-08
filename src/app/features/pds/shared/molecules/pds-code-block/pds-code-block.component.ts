import { Component, input } from '@angular/core';

@Component({
  selector: 'app-pds-code-block',
  standalone: true,
  template: `
    <div class="code-block">
      <pre class="code-block-pre"><code>{{ code() }}</code></pre>

      @if (footer()) {
        <footer class="code-block-footer">{{ footer() }}</footer>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .code-block {
      --_bg: var(--code-block-bg, #181825);
      --_footer-bg: var(--code-block-footer-bg, #1e1e2e);
      --_border: var(--code-block-border, #313244);
      --_text: var(--code-block-text, #cdd6f4);
      --_text-muted: var(--code-block-text-muted, #a6adc8);

      background: var(--_bg);
    }

    .code-block-pre {
      margin: 0;
      padding: 1rem 1.25rem;
      overflow-x: auto;

      &::-webkit-scrollbar {
        height: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--_border);
        border-radius: 3px;
      }

      code {
        font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
        font-size: 0.8125rem;
        line-height: 1.7;
        color: var(--_text);
        white-space: pre;
        tab-size: 2;
      }
    }

    .code-block-footer {
      padding: 0.625rem 1.25rem;
      font-size: 0.75rem;
      color: var(--_text-muted);
      background: var(--_footer-bg);
      border-top: 1px solid var(--_border);
    }
  `,
})
export class PdsCodeBlockComponent {
  code = input.required<string>();
  footer = input('💡 Solo incluye las propiedades que difieren de los defaults.');
}