import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './app-card.component.html',
  styleUrl: './app-card.component.scss'
})
export class AppCardComponent {
  // Header configuration
  title = input<string>();
  icon = input<string>();
  showHeader = input<boolean>(true);

  // Visual configuration
  variant = input<'outlined' | 'raised'>('outlined');
  contentPadding = input<string>('p-5');
  customClass = input<string>('');

  // Layout options
  sticky = input<boolean>(false);
  fullHeight = input<boolean>(false);
}
