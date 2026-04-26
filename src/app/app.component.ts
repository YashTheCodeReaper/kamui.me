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
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomEase from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);
CustomEase.create('reveal', '0.9, 0, 0.1, 1');

import {
  AssetCacheService,
  CacheStatus,
} from './core/services/asset-cache.service';
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
import { UserConsentComponent } from './user-consent/user-consent.component';

const MENU_CLOSE_DURATION_SECONDS = 0.5;
const MENU_REVEAL_SELECTOR = '.enc';
const MIN_SPLASH_MS = 3000;
const REVEAL_PREP_MS = 300;
const REVEAL_DURATION_S = 1.5;
const HEIGHT_COLLAPSE_DURATION_S = 0.75;
const HEIGHT_COLLAPSE_DELAY_S = 1;
const SPLASH_FADE_DURATION_S = 0.5;
const SPLASH_UNMOUNT_MS =
  (HEIGHT_COLLAPSE_DELAY_S + HEIGHT_COLLAPSE_DURATION_S + 0.25) * 1000;

const POLYGON_FULL = 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)';
const POLYGON_COLLAPSED = 'polygon(25% 75%, 75% 75%, 75% 75%, 25% 75%)';

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
    UserConsentComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy, AfterViewInit {
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

  isUserConsentedToTracking: boolean | undefined =
    localStorage.getItem('userConsent') === 'true'
      ? true
      : localStorage.getItem('userConsent') === 'false'
        ? false
        : undefined;

  ngAfterViewInit(): void {
    if (this.isUserConsentedToTracking !== undefined) {
      setTimeout(() => {
        this.bootstrapSplashFlow();
      }, 2000);
    }
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
    const minDelay = new Promise<void>((resolve) =>
      setTimeout(resolve, MIN_SPLASH_MS),
    );

    const priming = this.assetCache
      .prime((status) => this.zone.run(() => this.cacheStatus.set(status)))
      .catch((err) => {
        console.warn('[AppComponent] asset cache priming failed', err);
      });

    Promise.all([priming, minDelay]).then(() => {
      this.zone.run(() => {
        this.showMain.set(true);
        this.revealTimer = setTimeout(() => {
          this.refreshScroll();
          this.runRevealTimeline();
        }, REVEAL_PREP_MS);
      });
    });
  }

  private refreshScroll(): void {
    if (typeof window === 'undefined') return;

    const lenis = (window as unknown as { lenis?: { resize?: () => void } })
      .lenis;
    try {
      lenis?.resize?.();
    } catch {}

    try {
      ScrollTrigger.refresh();
    } catch {}
  }

  private runRevealTimeline(): void {
    gsap.fromTo(
      '.main_revealer',
      { clipPath: POLYGON_FULL },
      {
        clipPath: POLYGON_COLLAPSED,
        ease: 'reveal',
        duration: REVEAL_DURATION_S,
      },
    );

    gsap.to('.main_revealer', {
      height: 0,
      ease: 'power4.out',
      duration: HEIGHT_COLLAPSE_DURATION_S,
      delay: HEIGHT_COLLAPSE_DELAY_S,
    });

    gsap.to('.splash_section', {
      opacity: 0,
      ease: 'power2.out',
      duration: SPLASH_FADE_DURATION_S,
    });

    this.splashUnmountTimer = setTimeout(() => {
      this.showSplash.set(false);
      this.refreshScroll();
    }, SPLASH_UNMOUNT_MS);
  }

  onUserConsentAction(consent: boolean | undefined): void {
    this.isUserConsentedToTracking = consent;
    setTimeout(() => {
      this.bootstrapSplashFlow();
    }, 2000);
  }
}
