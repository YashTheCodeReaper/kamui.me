export interface MenuItem {
  readonly label: string;
  readonly active?: boolean;
}

export const MENU_ITEMS: readonly MenuItem[] = [
  { label: 'Home', active: true },
  { label: 'Skills' },
  { label: 'Portfolio' },
  { label: 'Blogs' },
];

export interface MenuMiniAction {
  readonly title: string;
  readonly label?: string;
  readonly href?: string;
}

export const MENU_MINI_ACTIONS: readonly MenuMiniAction[] = [
  { title: 'Get My CV' },
  { title: 'Contact' },
  { title: 'Mail me at', label: 'kamui.me@gmail.com', href: 'mailto:kamui.me@gmail.com' },
];
