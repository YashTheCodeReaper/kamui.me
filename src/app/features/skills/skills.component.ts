import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ButtonComponent } from '../../shared/components/button/button.component';
import { TextRevealDirective } from '../../shared/directives/text-reveal.directive';
import { SKILLS, SKILLS_INTRO } from './data/skills';

const SECTION_SELECTOR = '.skills_section';
const PIN_SELECTOR = '.ss_left_box';
const STICKER_SELECTOR = '.skills_section .sticker';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [ButtonComponent, TextRevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent implements AfterViewInit, OnDestroy {
  protected readonly skills = SKILLS;
  protected readonly intro = SKILLS_INTRO;

  private pinTrigger?: ScrollTrigger;
  private stickerTween?: gsap.core.Tween;

  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);
    this.pinLeftColumn();
    this.spinSticker();
  }

  ngOnDestroy(): void {
    this.pinTrigger?.kill();
    this.stickerTween?.scrollTrigger?.kill();
    this.stickerTween?.kill();
  }

  protected onContactClick(): void {
    // Future hook: emit analytics or scroll to contact section.
  }

  private pinLeftColumn(): void {
    this.pinTrigger = ScrollTrigger.create({
      trigger: SECTION_SELECTOR,
      pin: PIN_SELECTOR,
      start: 'top top',
      end: 'bottom bottom',
    });
  }

  private spinSticker(): void {
    this.stickerTween = gsap.fromTo(
      STICKER_SELECTOR,
      { rotate: 0 },
      {
        rotate: 360,
        scrollTrigger: {
          trigger: SECTION_SELECTOR,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
  }
}
