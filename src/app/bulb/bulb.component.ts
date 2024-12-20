import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UiService } from '../services/ui.service';

declare var document: any;

@Component({
  selector: 'app-bulb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulb.component.html',
  styleUrl: './bulb.component.scss',
})
export class BulbComponent {
  isDarkMode: boolean = true;

  constructor(private uiService: UiService) {}

  toggleMode(): void {
    try {
      document
        .querySelector('.bulb')
        .getAnimations()
        .forEach((anim: any) => {
          anim.cancel();
          anim.play();
        });
      this.isDarkMode = !this.isDarkMode;
      this.uiService.toggleTheme();
    } catch (ex) {
      console.error(ex);
    }
  }
}
