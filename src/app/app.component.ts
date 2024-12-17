import { Component } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { SplashComponent } from './splash/splash.component';
import { LogoComponent } from './logo/logo.component';
import { MenuComponent } from './menu/menu.component';
import { UiService } from './services/ui.service';
import { CommonModule } from '@angular/common';
import { gsap, Power4 } from 'gsap';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HomeComponent,
    SplashComponent,
    LogoComponent,
    MenuComponent,
    CommonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public showMenu: boolean = false;

  constructor(private uiService: UiService) {}

  toggleMenu(): void {
    try {
      if (this.showMenu) {
        gsap.to('.ms_c', {
          height: '0%',
          duration: 0.5,
          ease: Power4.easeIn,
        });
        setTimeout(() => {
          this.showMenu = false;
        }, 500);
      } else this.showMenu = !this.showMenu;
    } catch (ex) {
      console.error(ex);
    }
  }
}
