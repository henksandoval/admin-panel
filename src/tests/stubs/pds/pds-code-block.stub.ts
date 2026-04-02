import { Component, input } from '@angular/core';

@Component({
  selector: 'app-pds-code-block',
  standalone: true,
  template: `<pre data-testid="code-block-stub">{{ code() }}</pre>`,
})
export class PdsCodeBlockStubComponent {
  readonly code = input.required<string>();
  readonly language = input('xml');
  readonly footer = input('');
}
