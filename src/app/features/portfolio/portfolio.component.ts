import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';

import { PortfolioSlide, PortfolioSliderRenderer } from './portfolio.renderer';

// Slides driven by the assets in src/assets/images/portfolio. Per-slide
// heights are randomised at runtime, so order here doesn't dictate rhythm.
const SLIDES: readonly PortfolioSlide[] = [
  { name: 'Signature Mark', img: 'assets/images/portfolio/signature-mark.webp' },
  { name: 'Hero Landing', img: 'assets/images/portfolio/hero-landing.webp' },
  { name: 'Photo Grid', img: 'assets/images/portfolio/photo-grid.webp' },
  { name: 'Ghost Of Sparta', img: 'assets/images/portfolio/ghost-of-sparta.webp' },
  { name: 'Design • Develop • Replicate', img: 'assets/images/portfolio/design-develop-replicate.webp' },
  { name: 'Tech Stack', img: 'assets/images/portfolio/tech-stack.webp' },
  { name: 'Summon Me', img: 'assets/images/portfolio/summon-me.webp' },
  { name: 'Frame 01', img: 'assets/images/portfolio/1712634669028.jpeg' },
  { name: 'Frame 02', img: 'assets/images/portfolio/1712634669042.jpeg' },
  { name: 'Frame 03', img: 'assets/images/portfolio/1712634669063.jpeg' },
  { name: 'Frame 04', img: 'assets/images/portfolio/1712634670023.jpeg' },
  { name: 'Frame 05', img: 'assets/images/portfolio/1712634670523.jpeg' },
  { name: 'Frame 06', img: 'assets/images/portfolio/1740491691177.jpeg' },
  { name: 'Frame 07', img: 'assets/images/portfolio/1740491691803.jpeg' },
  { name: 'Frame 08', img: 'assets/images/portfolio/1740491692512.jpeg' },
  { name: 'Frame 09', img: 'assets/images/portfolio/1757822987873.jpeg' },
  { name: 'Frame 10', img: 'assets/images/portfolio/1757822988586.jpeg' },
  { name: 'Frame 11', img: 'assets/images/portfolio/1757822989505.jpeg' },
  { name: 'Frame 12', img: 'assets/images/portfolio/1757822989759.jpeg' },
];

const padTwo = (value: number): string => String(value).padStart(2, '0');

@Component({
  selector: 'app-portfolio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly slides = SLIDES;
  protected readonly activeIndex = signal(0);
  protected readonly activeSlide = computed(() => this.slides[this.activeIndex()]);
  protected readonly counterLabel = computed(
    () => `${padTwo(this.activeIndex() + 1)} / ${padTwo(this.slides.length)}`,
  );

  private renderer?: PortfolioSliderRenderer;

  ngAfterViewInit(): void {
    try {
      this.renderer = new PortfolioSliderRenderer(
        this.canvasRef.nativeElement,
        this.hostRef.nativeElement,
        this.slides,
        index => this.activeIndex.set(index),
      );
      this.renderer.start();
    } catch (err) {
      console.warn('[Portfolio] disabled', err);
    }
  }

  ngOnDestroy(): void {
    this.renderer?.dispose();
  }
}
