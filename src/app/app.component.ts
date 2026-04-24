import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { gsap, Power4 } from 'gsap';

import { AboutComponent } from './features/about/about.component';
import { HomeComponent } from './features/home/home.component';
import { HeaderComponent } from './layout/header/header.component';
import { MenuComponent } from './layout/menu/menu.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { BulbComponent } from './shared/components/bulb/bulb.component';

const MENU_CLOSE_DURATION_SECONDS = 0.5;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    MenuComponent,
    BulbComponent,
    HomeComponent,
    AboutComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    if (!this.menuOpen()) {
      this.menuOpen.set(true);
      return;
    }
    this.closeMenu();
  }

  private closeMenu(): void {
    gsap.set('.enc', { top: 'unset', bottom: 0 });
    gsap.to('.enc', {
      height: '0%',
      duration: MENU_CLOSE_DURATION_SECONDS,
      ease: Power4.easeIn,
      onComplete: () => this.menuOpen.set(false),
    });
  }
}
