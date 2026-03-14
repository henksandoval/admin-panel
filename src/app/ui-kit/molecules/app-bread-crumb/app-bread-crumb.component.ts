import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AppBreadcrumbItem } from '@ui-types';
import { BREAD_CRUMB_DEFAULTS } from './app-bread-crumb.model';

@Component({
  selector: 'app-bread-crumb',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './app-bread-crumb.component.html',
  styleUrl: './app-bread-crumb.component.scss'
})
export class AppBreadCrumbComponent {
  readonly items = input<AppBreadcrumbItem[]>(BREAD_CRUMB_DEFAULTS.items);
}