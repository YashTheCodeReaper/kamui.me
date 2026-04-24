import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { gsap, Power4 } from 'gsap';

import { MENU_SOCIAL_LINKS } from '../../shared/data/social-links';
import { MENU_ITEMS, MENU_MINI_ACTIONS } from './data/menu-items';

const REVEAL_SELECTOR = '.enc';
const REVEAL_DURATION_SECONDS = 0.5;

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements AfterViewInit {
  protected readonly items = MENU_ITEMS;
  protected readonly miniActions = MENU_MINI_ACTIONS;
  protected readonly socialLinks = MENU_SOCIAL_LINKS;

  ngAfterViewInit(): void {
    gsap.to(REVEAL_SELECTOR, {
      height: '100%',
      duration: REVEAL_DURATION_SECONDS,
      ease: Power4.easeOut,
    });
  }
}
