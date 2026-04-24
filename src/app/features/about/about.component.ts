import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SLIDER_SELECTOR = '.as_slider_overlay';
const SECTION_SELECTOR = '.about_section';

interface ParallaxRule {
  readonly selector: string;
  readonly xMultiplier: number;
  readonly backgroundParallax?: boolean;
}

const PARALLAX_RULES: readonly ParallaxRule[] = [
  { selector: '.as_slider_overlay .c1 h3',             xMultiplier: 100 },
  { selector: '.as_slider_overlay .c1 img',            xMultiplier: -250 },
  { selector: '.as_slider_overlay .c1 p',              xMultiplier: -550 },
  { selector: '.as_slider_overlay .c2 h3',             xMultiplier: -50 },
  { selector: '.as_slider_overlay .c2 .img_container', xMultiplier: -200, backgroundParallax: true },
  { selector: '.as_slider_overlay .c3 h3',             xMultiplier: -50 },
  { selector: '.as_slider_overlay .c3 .img_container', xMultiplier: -200, backgroundParallax: true },
];

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  private scrollTween?: gsap.core.Tween;

  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);
    this.scrollTween = gsap.fromTo(
      SLIDER_SELECTOR,
      { x: 0 },
      {
        x: '-100vw',
        stagger: 2,
        scrollTrigger: {
          trigger: SECTION_SELECTOR,
          pin: SLIDER_SELECTOR,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
        onUpdate: () => this.applyParallax(),
      },
    );
  }

  ngOnDestroy(): void {
    this.scrollTween?.scrollTrigger?.kill();
    this.scrollTween?.kill();
  }

  private applyParallax(): void {
    const ratio = this.scrollTween?.ratio;
    if (ratio === undefined) return;

    for (const rule of PARALLAX_RULES) {
      const x = ratio * rule.xMultiplier;
      if (rule.backgroundParallax) {
        gsap.fromTo(
          rule.selector,
          { x: 0, backgroundPosition: '60% 50%' },
          {
            x,
            backgroundPosition: `${ratio * -40 + 60}% ${ratio * -40 + 50}%`,
            duration: 0,
          },
        );
      } else {
        gsap.fromTo(rule.selector, { x: 0 }, { x, duration: 0 });
      }
    }
  }
}
