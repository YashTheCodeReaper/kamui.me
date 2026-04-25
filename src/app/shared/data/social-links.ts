import { SocialLink } from '../models/social-link.model';

/**
 * Canonical contact / social URLs. Anything left as `undefined` will render
 * as an inert icon — fill these in as accounts go live.
 *
 * TODO: replace placeholders below with real account URLs.
 *   - LinkedIn, Discord, WhatsApp, Twitter, Messenger
 */
const EMAIL_HREF = 'mailto:touch@yashkamui.me';
const INSTAGRAM_HREF = 'https://instagram.com/_yash_itaxxci';

export const SIDEBAR_SOCIAL_LINKS: readonly SocialLink[] = [
  { platform: 'Instagram', iconClass: 'fi fi-brands-instagram', url: INSTAGRAM_HREF },
  { platform: 'Discord',   iconClass: 'fi fi-brands-discord' },
  { platform: 'LinkedIn',  iconClass: 'fi fi-brands-linkedin' },
];

export const MENU_SOCIAL_LINKS: readonly SocialLink[] = [
  { platform: 'Instagram', iconClass: 'fi fi-brands-instagram', url: INSTAGRAM_HREF },
  { platform: 'Discord',   iconClass: 'fi fi-brands-discord' },
  { platform: 'LinkedIn',  iconClass: 'fi fi-brands-linkedin' },
  { platform: 'WhatsApp',  iconClass: 'fi fi-brands-whatsapp' },
  { platform: 'Twitter',   iconClass: 'fi fi-brands-twitter-alt-square' },
  { platform: 'Email',     iconClass: 'fi fi-br-at',           url: EMAIL_HREF },
  { platform: 'Messenger', iconClass: 'fi fi-brands-facebook-messenger' },
];
