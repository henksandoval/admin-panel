import { Component } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatButton
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
}

