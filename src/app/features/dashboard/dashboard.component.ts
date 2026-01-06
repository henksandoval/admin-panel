import { Component } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import {MatButton, MatFabButton, MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MatFabButton,
    MatIconButton,
    MatMiniFabButton
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
}

