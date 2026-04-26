import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  NgZone,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { gsap, Power4 } from 'gsap';

import { AssetCacheService, CacheStatus } from './core/services/asset-cache.service';
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
import { FluidCursorComponent } from './shared/components/fluid-cursor/fluid-cursor.component';
import { OrientationNoticeComponent } from './shared/components/orientation-notice/orientation-notice.component';
import { PortfolioComponent } from './features/portfolio/portfolio.component';
import { SplashComponent } from './splash/splash.component';

const MENU_CLOSE_DURATION_SECONDS = 0.5;
const MENU_REVEAL_SELECTOR = '.enc';
const MIN_SPLASH_MS = 4000;
const REVEAL_PREP_MS = 300;
const REVEAL_DURATION_S = 1.2;
const SPLASH_FADE_DURATION_S = 0.5;
const SPLASH_UNMOUNT_MS = (REVEAL_DURATION_S + 0.2) * 1000;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    SplashComponent,
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
    OrientationNoticeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit, OnDestroy {
  protected readonly menuOpen = signal(false);

  protected readonly showMain = signal(false);

  protected readonly showSplash = signal(true);

  protected readonly cacheStatus = signal<CacheStatus>({
    progress: 0,
    completed: 0,
    total: 0,
    phase: 'idle',
  });

  private readonly assetCache = inject(AssetCacheService);
  private readonly zone = inject(NgZone);

  private revealTimer?: ReturnType<typeof setTimeout>;
  private splashUnmountTimer?: ReturnType<typeof setTimeout>;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.bootstrapSplashFlow();
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.revealTimer) clearTimeout(this.revealTimer);
    if (this.splashUnmountTimer) clearTimeout(this.splashUnmountTimer);
  }

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

  private bootstrapSplashFlow(): void {
    const minDelay = new Promise<void>(resolve =>
      setTimeout(resolve, MIN_SPLASH_MS),
    );

    const priming = this.assetCache
      .prime(status =>
        this.zone.run(() => this.cacheStatus.set(status)),
      )
      .catch(err => {
        console.warn('[AppComponent] asset cache priming failed', err);
      });

    Promise.all([priming, minDelay]).then(() => {
      this.zone.run(() => {
        this.showMain.set(true);
        this.revealTimer = setTimeout(
          () => this.runRevealTimeline(),
          REVEAL_PREP_MS,
        );
      });
    });
  }

  private runRevealTimeline(): void {
    gsap.to('.main_revealer', {
      height: 0,
      ease: 'power4.inOut',
      duration: REVEAL_DURATION_S,
    });
    gsap.to('.splash_section', {
      opacity: 0,
      ease: 'power2.out',
      duration: SPLASH_FADE_DURATION_S,
    });
    this.splashUnmountTimer = setTimeout(() => {
      this.showSplash.set(false);
    }, SPLASH_UNMOUNT_MS);
  }
}
