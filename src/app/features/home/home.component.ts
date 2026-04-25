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

import {
  ModelScene,
  decoratePbrMetal,
  pbrRedKeyLighting,
} from '../../shared/three/model-scene';
import { TextRevealDirective } from '../../shared/directives/text-reveal.directive';
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

  protected readonly slides = FEATURE_SLIDES;
  protected readonly activeIndex = signal(0);
  protected readonly activeSlide = computed(() => this.slides[this.activeIndex()]);

  private maskScene?: ModelScene;
  private cycleTimer?: ReturnType<typeof setInterval>;
  private exitTimer?: ReturnType<typeof setTimeout>;
  private heroVideoObserver?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.initBackgroundGradient();
    this.initSlider();
    this.initMaskScene();
    this.initHeroVideo();
  }

  ngOnDestroy(): void {
    if (this.cycleTimer) clearInterval(this.cycleTimer);
    if (this.exitTimer) clearTimeout(this.exitTimer);
    this.heroVideoObserver?.disconnect();
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
              video.src = HERO_VIDEO_PATH;
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
      .load(MASK_MODEL_PATH)
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
