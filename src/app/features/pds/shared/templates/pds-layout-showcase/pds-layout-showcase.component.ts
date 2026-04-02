import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AppCardComponent } from '@ui-atoms/app-card';
import { PdsCodeBlockComponent } from '../../molecules/pds-code-block';

@Component({
  selector: 'app-pds-layout-showcase',
  standalone: true,
  imports: [MatIconModule, AppCardComponent, PdsCodeBlockComponent],
  templateUrl: './pds-layout-showcase.component.html',
  styleUrl: './pds-layout-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdsLayoutShowcaseComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly preset = input.required<string>();
  readonly codeExample = input.required<string>();
}
