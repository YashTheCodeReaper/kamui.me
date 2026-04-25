import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { gsap, Power4 } from 'gsap';

import { AboutComponent } from './features/about/about.component';
import { DesignationComponent } from './features/designation/designation.component';
import { HomeComponent } from './features/home/home.component';
import { QuoteComponent } from './features/quote/quote.component';
import { SkillsComponent } from './features/skills/skills.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/header.component';
import { MenuComponent } from './layout/menu/menu.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { BulbComponent } from './shared/components/bulb/bulb.component';
import { FluidCursorComponent } from "./shared/components/fluid-cursor/fluid-cursor.component";
import { OrientationNoticeComponent } from './shared/components/orientation-notice/orientation-notice.component';
import { PortfolioComponent } from "./features/portfolio/portfolio.component";

const MENU_CLOSE_DURATION_SECONDS = 0.5;
const MENU_REVEAL_SELECTOR = '.enc';

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
    DesignationComponent,
    SkillsComponent,
    QuoteComponent,
    FooterComponent,
    FluidCursorComponent,
    PortfolioComponent,
    OrientationNoticeComponent
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
    gsap.set(MENU_REVEAL_SELECTOR, { top: 'unset', bottom: 0 });
    gsap.to(MENU_REVEAL_SELECTOR, {
      height: '0%',
      duration: MENU_CLOSE_DURATION_SECONDS,
      ease: Power4.easeIn,
      onComplete: () => this.menuOpen.set(false),
    });
  }
}
