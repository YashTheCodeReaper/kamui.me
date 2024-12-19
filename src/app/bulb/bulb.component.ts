import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-bulb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulb.component.html',
  styleUrl: './bulb.component.scss'
})
export class BulbComponent {
  isDarkMode: boolean = true;

  constructor(private uiService: UiService) {}
  
  toggleMode(): void {
    try {
      this.isDarkMode = !this.isDarkMode;
      this.uiService.toggleTheme()
    } catch (ex) {
      console.error(ex)
    }
  }
  
}
