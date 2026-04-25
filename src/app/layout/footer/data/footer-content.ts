export interface FooterNavLink {
  readonly label: string;
  readonly href?: string;
}

export interface FooterContact {
  readonly intro: string;
  readonly value: string;
  readonly href?: string;
}

export const FOOTER_PITCH =
  'All I need is a breakthrough and meaningful collaboration in AI and ' +
  'technology. Let\u2019s connect.';

export const FOOTER_NAV_LINKS: readonly FooterNavLink[] = [
  { label: 'Skills' },
  { label: 'Portfolio' },
  { label: 'Blogs' },
];

export const FOOTER_CONTACTS: readonly FooterContact[] = [
  { intro: 'Chat with me:', value: '_yash_itaxxci' },
  { intro: 'Write to me:', value: 'yash.kamui.me@gmail.com', href: 'mailto:yash.kamui.me@gmail.com' },
];

export const FOOTER_COPYRIGHT = `\u00A9 ${new Date().getFullYear()} Kamui.me. All rights reserved.`;
