import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { NavTreeInlineComponent } from '../nav-tree-inline/nav-tree-inline.component';

@Component({
  selector: 'app-nav-tree-floating',
  standalone: true,
  imports: [NavTreeInlineComponent],
  templateUrl: './nav-tree-floating.component.html',
  styleUrl: './nav-tree-floating.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavTreeFloatingComponent {
  topPosition = input<number>(0);

  closed = output<void>();

  protected onMouseLeave(): void {
    this.closed.emit();
  }
}
