import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
} from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ButtonComponent } from '../../shared/components/button/button.component';
import { TextRevealDirective } from '../../shared/directives/text-reveal.directive';
import { scrollToSection } from '../../shared/utils/scroll';
import {
  FOOTER_CONTACTS,
  FOOTER_COPYRIGHT,
  FOOTER_EXTRA_LINKS,
  FOOTER_NAV_LINKS,
  FOOTER_PITCH,
  FooterNavLink,
} from './data/footer-content';

const TRIGGER_SELECTOR = '.footer';
const FOOTER_SELECTOR = 'footer';

interface ScrubAnimation {
  readonly target: string;
  readonly from: gsap.TweenVars;
  readonly to: gsap.TweenVars;
}

const SCROLL_ANIMATIONS: readonly ScrubAnimation[] = [
  { target: '.kamui_foot h1', from: { y: 1000, opacity: 0 }, to: { y: 0, opacity: 1 } },
  { target: '.footer_extra',  from: { y: -500, opacity: 0 }, to: { y: 0, opacity: 1 } },
  { target: '.footer_top',    from: { y: -500, opacity: 0 }, to: { y: 0, opacity: 1 } },
  {
    target: '.footer img',
    from: { marginTop: -300, opacity: 0 },
    to: { marginTop: 0, opacity: 0.25 },
  },
];

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TextRevealDirective, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements AfterViewInit, OnDestroy {
  protected readonly pitch = FOOTER_PITCH;
  protected readonly navLinks = FOOTER_NAV_LINKS;
  protected readonly contacts = FOOTER_CONTACTS;
  protected readonly extraLinks = FOOTER_EXTRA_LINKS;
  protected readonly copyright = FOOTER_COPYRIGHT;

  private tweens: gsap.core.Tween[] = [];

  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);
    this.tweens = SCROLL_ANIMATIONS.map(animation => this.createScrubTween(animation));
  }

  ngOnDestroy(): void {
    for (const tween of this.tweens) {
      tween.scrollTrigger?.kill();
      tween.kill();
    }
    this.tweens = [];
  }

  protected onContactClick(): void {
    // The "Get In Touch" CTA on the footer itself just settles the user back
    // at the top of the footer — feels weird, but at least it's not a no-op.
    scrollToSection(FOOTER_SELECTOR);
  }

  protected onNavLinkClick(link: FooterNavLink, event: MouseEvent): void {
    if (!link.target) return;
    event.preventDefault();
    scrollToSection(link.target);
  }

  protected accent(label: string): string {
    return label.charAt(0);
  }

  protected rest(label: string): string {
    return label.slice(1);
  }

  private createScrubTween({ target, from, to }: ScrubAnimation): gsap.core.Tween {
    return gsap.fromTo(target, from, {
      ...to,
      scrollTrigger: {
        trigger: TRIGGER_SELECTOR,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: true,
      },
    });
  }
}
