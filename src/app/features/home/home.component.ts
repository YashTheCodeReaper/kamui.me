import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { gsap, Power3 } from 'gsap';

import { AssetCacheService } from '../../core/services/asset-cache.service';
import {
  ModelScene,
  decoratePbrMetal,
  pbrRedKeyLighting,
} from '../../shared/three/model-scene';
import { TextRevealDirective } from '../../shared/directives/text-reveal.directive';
import {
  subscribeToDeviceOrientation,
  supportsDeviceOrientation,
} from '../../shared/utils/device-orientation';
import { FEATURE_SLIDES } from './data/feature-slides';

declare const Gradient: new () => { initGradient(selector: string): void };

const GRADIENT_SELECTOR = '#home-gradient-canvas';
const MASK_MODEL_PATH = 'assets/models/samumask.glb';
const HERO_VIDEO_PATH = 'assets/videos/vader.mp4';
const SLIDE_INTERVAL_MS = 12_000;
const SLIDE_EXIT_DELAY_MS = 10_000;
const SLIDE_OFFSCREEN = '-50rem';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TextRevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sceneHost', { static: true }) private readonly sceneHost!: ElementRef<HTMLElement>;
  @ViewChild('heroVideo', { static: true })
  private readonly heroVideoRef!: ElementRef<HTMLVideoElement>;

  private readonly document = inject(DOCUMENT);
  private readonly assetCache = inject(AssetCacheService);

  protected readonly slides = FEATURE_SLIDES;
  protected readonly activeIndex = signal(0);
  protected readonly activeSlide = computed(() => this.slides[this.activeIndex()]);

  private maskScene?: ModelScene;
  private cycleTimer?: ReturnType<typeof setInterval>;
  private exitTimer?: ReturnType<typeof setTimeout>;
  private heroVideoObserver?: IntersectionObserver;
  private orientationUnsubscribe?: () => void;

  ngAfterViewInit(): void {
    this.initBackgroundGradient();
    this.initSlider();
    this.initMaskScene();
    this.initHeroVideo();
    this.initGyroscopeMaskControl();
  }

  ngOnDestroy(): void {
    if (this.cycleTimer) clearInterval(this.cycleTimer);
    if (this.exitTimer) clearTimeout(this.exitTimer);
    this.heroVideoObserver?.disconnect();
    this.orientationUnsubscribe?.();
    this.maskScene?.dispose();
  }

  @HostListener('window:mousemove', ['$event'])
  protected onPointerMove(event: MouseEvent): void {
    this.maskScene?.setPointer(event.clientX, event.clientY);
  }

  protected onVideoHover(reveal: boolean): void {
    this.document.querySelectorAll<HTMLElement>('.vc_bg').forEach(el => {
      el.style.height = reveal ? '0%' : '100%';
    });
    this.document.body.classList.toggle('theme_default');

    const canvas = this.document.querySelector<HTMLElement>(GRADIENT_SELECTOR);
    if (canvas) canvas.style.opacity = reveal ? '0' : '1';
  }

  private initBackgroundGradient(): void {
    new Gradient().initGradient(GRADIENT_SELECTOR);
  }

  /**
   * Hero video is ~30 MB — defer loading until the user is actually near the
   * video section, then pause when scrolled away so the decoder isn't burning
   * battery on hidden frames.
   */
  private initHeroVideo(): void {
    const video = this.heroVideoRef.nativeElement;
    let loaded = false;

    this.heroVideoObserver = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!loaded) {
              video.src = this.assetCache.cachedUrl(HERO_VIDEO_PATH);
              loaded = true;
            }
            void video.play().catch(() => {
              /* autoplay blocked — ignore */
            });
          } else if (loaded) {
            video.pause();
          }
        }
      },
      { rootMargin: '25% 0px' },
    );
    this.heroVideoObserver.observe(video);
  }

  /**
   * Touch devices have no `mousemove` to drive the mask, so the model just
   * sits frozen. Hook the gyroscope instead and synthesise a "virtual
   * pointer" position from the device tilt — same `setPointer()` API the
   * mouse path already uses, so the existing rotation smoothing kicks in
   * unchanged.
   *
   * Tilt mapping:
   *   - `gamma` (left-right tilt, -90..90)   →  virtual clientX
   *     Clamped to ±35° so a tiny lean produces a meaningful rotation
   *     and the user doesn't need to pivot the device wildly.
   *   - `beta` (front-back tilt, -180..180)  →  virtual clientY
   *     Centred around 60° (a comfortable phone-in-hand angle), clamped
   *     to ±30° around that so vertical motion has perceptible range.
   *
   * No-ops on non-touch devices and on iOS until the user grants the
   * permission prompt (deferred to the next tap by the helper).
   */
  private initGyroscopeMaskControl(): void {
    if (!supportsDeviceOrientation()) return;

    const GAMMA_RANGE = 35; // ±35° → full horizontal sweep
    const BETA_CENTRE = 60; // baseline phone-in-hand pitch
    const BETA_RANGE = 30; // ±30° around the baseline

    this.orientationUnsubscribe = subscribeToDeviceOrientation(({ beta, gamma }) => {
      if (!this.maskScene) return;
      const w = window.innerWidth;
      const h = window.innerHeight;

      const gammaClamped = Math.max(-GAMMA_RANGE, Math.min(GAMMA_RANGE, gamma));
      const virtualX = ((gammaClamped + GAMMA_RANGE) / (GAMMA_RANGE * 2)) * w;

      const betaClamped = Math.max(
        BETA_CENTRE - BETA_RANGE,
        Math.min(BETA_CENTRE + BETA_RANGE, beta),
      );
      // Invert so tilting forward (lower beta) raises the mask's gaze and
      // tilting back (higher beta) lowers it — matches what feels natural.
      const virtualY = ((BETA_CENTRE + BETA_RANGE - betaClamped) / (BETA_RANGE * 2)) * h;

      this.maskScene.setPointer(virtualX, virtualY);
    });
  }

  private initMaskScene(): void {
    this.maskScene = new ModelScene(this.sceneHost.nativeElement, {
      lights: pbrRedKeyLighting,
      decorateMesh: decoratePbrMetal,
      cameraDistanceMultiplier: 1.25,
      pointerSensitivity: 0.5,
      frameModel: (model, { center }) => {
        // Preserve the original mask framing (slight Z push).
        model.position.set(center.x, -center.y, -center.z * 1.2);
      },
    });
    this.maskScene
      .load(this.assetCache.cachedUrl(MASK_MODEL_PATH))
      .catch(err => console.error('[HomeComponent] mask load failed', err));
    this.maskScene.start();
  }

  private initSlider(): void {
    this.showSlide(this.activeIndex());
    this.cycleTimer = setInterval(() => this.advanceSlide(), SLIDE_INTERVAL_MS);
  }

  private advanceSlide(): void {
    const previous = this.activeIndex();
    const next = (previous + 1) % this.slides.length;
    this.setIndicator(previous, false);
    this.activeIndex.set(next);
    this.showSlide(next);
  }

  private showSlide(index: number): void {
    this.setIndicator(index, true);
    this.animateHeadlineIn();
    if (this.exitTimer) clearTimeout(this.exitTimer);
    this.exitTimer = setTimeout(() => this.animateHeadlineOut(), SLIDE_EXIT_DELAY_MS);
  }

  private setIndicator(index: number, active: boolean): void {
    const indicator = this.document.querySelector(`.si${index + 1}`);
    if (active) indicator?.classList.add('active');
    else indicator?.classList.remove('active');
  }

  private animateHeadlineIn(): void {
    const base = { transform: 'translateX(0%)', ease: Power3.easeOut, duration: 1.5 };
    gsap.to('.fcf-h5', { ...base, delay: 1.5 });
    gsap.to('.fcf-h11', { ...base, delay: 0.5 });
    gsap.to('.fcf-h12', { ...base, delay: 0.75 });
  }

  private animateHeadlineOut(): void {
    const base = {
      transform: `translateX(${SLIDE_OFFSCREEN})`,
      ease: Power3.easeInOut,
      duration: 1.5,
    };
    gsap.to('.fcf-h5', { ...base, delay: 0 });
    gsap.to('.fcf-h11', { ...base, delay: 0.5 });
    gsap.to('.fcf-h12', { ...base, delay: 0.75 });
  }
}
