import { AfterViewInit, ChangeDetectionStrategy, Component, output } from '@angular/core';
import { gsap, Power4 } from 'gsap';

import { MENU_SOCIAL_LINKS } from '../../shared/data/social-links';
import { scrollToSection, scrollToTop } from '../../shared/utils/scroll';
import { MENU_ITEMS, MENU_MINI_ACTIONS, MenuItem, MenuMiniAction } from './data/menu-items';

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

  /** Emitted whenever a menu interaction should also close the menu. */
  readonly close = output<void>();

  ngAfterViewInit(): void {
    gsap.to(REVEAL_SELECTOR, {
      height: '100%',
      duration: REVEAL_DURATION_SECONDS,
      ease: Power4.easeOut,
    });
  }

  protected onItemClick(item: MenuItem): void {
    if (!item.target) {
      // No section wired (e.g. Blogs) — don't pretend the click did something.
      return;
    }
    if (item.target === '#top') {
      scrollToTop();
    } else {
      scrollToSection(item.target);
    }
    this.close.emit();
  }

  protected onMiniActionClick(action: MenuMiniAction, event: MouseEvent): void {
    if (action.scrollTo) {
      event.preventDefault();
      scrollToSection(action.scrollTo);
      this.close.emit();
      return;
    }
    if (action.href) {
      // Anchors handle navigation natively — just close the menu so the user
      // returns to a clean page when the new tab/mail-app finishes.
      this.close.emit();
    }
  }
}
