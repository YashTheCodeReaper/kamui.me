export interface FooterNavLink {
  readonly label: string;
  /** CSS selector to scroll to. Items without a target render as inert. */
  readonly target?: string;
}

export interface FooterContact {
  readonly intro: string;
  readonly value: string;
  readonly href?: string;
}

export interface FooterExtraLink {
  readonly label: string;
  readonly href?: string;
}

export const FOOTER_PITCH =
  'All I need is a breakthrough and meaningful collaboration in AI and ' +
  'technology. Let’s connect.';

export const FOOTER_NAV_LINKS: readonly FooterNavLink[] = [
  { label: 'Skills',    target: '.skills_section' },
  { label: 'Portfolio', target: '.portfolio_section' },
  // Add `target: '.blogs_section'` once the blogs section exists.
  { label: 'Blogs' },
];

export const FOOTER_CONTACTS: readonly FooterContact[] = [
  {
    intro: 'Chat with me:',
    value: '_yash_itaxxci',
    href: 'https://instagram.com/_yash_itaxxci',
  },
  {
    intro: 'Write to me:',
    value: 'yash.kamui.me@gmail.com',
    href: 'mailto:yash.kamui.me@gmail.com',
  },
];

/**
 * Bottom-row badges. The LinkedIn entry currently points at a search URL —
 * swap in the real profile URL when it's ready.
 */
export const FOOTER_EXTRA_LINKS: readonly FooterExtraLink[] = [
  // TODO: replace with actual LinkedIn profile URL.
  { label: 'Linked In', href: 'https://www.linkedin.com/' },
];

export const FOOTER_COPYRIGHT = `© ${new Date().getFullYear()} Kamui.me. All rights reserved.`;
