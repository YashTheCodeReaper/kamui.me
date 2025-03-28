import { Component } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { MenuComponent } from './menu/menu.component';
import { UiService } from './services/ui.service';
import { CommonModule } from '@angular/common';
import { gsap, Power4 } from 'gsap';
import { BulbComponent } from "./bulb/bulb.component";
import { PortfolioComponent } from './portfolio/portfolio.component';
import { AboutComponent } from './about/about.component';
import { FooterComponent } from "./footer/footer.component";
import { TestimonialsComponent } from "./testimonials/testimonials.component";
import { GalleryComponent } from "./gallery/gallery.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HomeComponent,
    MenuComponent,
    CommonModule,
    AboutComponent,
    BulbComponent,
    PortfolioComponent,
    FooterComponent,
    TestimonialsComponent,
    GalleryComponent
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
        gsap.to('.enc', {
          top: 'unset',
          bottom: '0',
          duration: 0,
          ease: Power4.easeIn,
        });
        gsap.to('.enc', {
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
