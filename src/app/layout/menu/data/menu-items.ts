export interface MenuItem {
  readonly label: string;
  /**
   * CSS selector of the section to scroll to when the item is clicked. Use
   * `'#top'` for the page top. Items without a target render as inert
   * placeholders (e.g. routes not built yet).
   */
  readonly target?: string;
  readonly active?: boolean;
}

export const MENU_ITEMS: readonly MenuItem[] = [
  { label: 'Home',      target: '#top',                active: true },
  { label: 'Skills',    target: '.skills_section' },
  { label: 'Portfolio', target: '.portfolio_section' },
  // No blog section yet — keep the entry visible but inert. Drop a target
  // once the section ships.
  { label: 'Blogs' },
];

export interface MenuMiniAction {
  readonly title: string;
  readonly label?: string;
  readonly href?: string;
  /** When set, treat the action as a same-tab link (e.g. file download). */
  readonly download?: string;
  /** When set, scroll to this CSS selector instead of following an href. */
  readonly scrollTo?: string;
}

export const MENU_MINI_ACTIONS: readonly MenuMiniAction[] = [
  // CV is served from `/assets/yashwanth-cv.pdf` — drop the file there to
  // make this download actually work; until then it'll 404.
  { title: 'Get My CV', href: 'assets/yashwanth-cv.pdf', download: 'Yashwanth-Kumar-CV.pdf' },
  { title: 'Contact', scrollTo: 'footer' },
  { title: 'Mail me at', label: 'touch@yashkamui.me', href: 'mailto:touch@yashkamui.me' },
];
