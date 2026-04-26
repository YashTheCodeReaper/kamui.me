/**
 * Asset cache manifest. Bump `ASSET_CACHE_VERSION` whenever any URL in
 * `CACHED_ASSETS` changes (renamed/replaced/dropped) — the cache service
 * compares this string against what's stored in IndexedDB and re-downloads
 * everything from scratch on a mismatch. Existing visitors will see the
 * splash progress run again on the next deploy that bumps the version.
 *
 * Versioning convention: `MAJOR.MINOR.BUILD`. Bump the build for asset-only
 * changes, the minor for additions, the major for sweeping rewrites.
 */
export const ASSET_CACHE_VERSION = '1.0.0';

const PORTFOLIO_FRAMES: readonly string[] = [
  '1712634669028.jpeg',
  '1712634669042.jpeg',
  '1712634669063.jpeg',
  '1712634670023.jpeg',
  '1712634670523.jpeg',
  '1740491691177.jpeg',
  '1740491691803.jpeg',
  '1740491692512.jpeg',
  '1757822987873.jpeg',
  '1757822988586.jpeg',
  '1757822989505.jpeg',
  '1757822989759.jpeg',
];

const PORTFOLIO_HERO: readonly string[] = [
  'signature-mark.webp',
  'hero-landing.webp',
  'photo-grid.webp',
  'ghost-of-sparta.webp',
  'design-develop-replicate.webp',
  'tech-stack.webp',
  'summon-me.webp',
];

/**
 * Heavy assets that benefit from explicit IndexedDB caching. Smaller assets
 * (icons, fonts, theme svgs) are left to the browser's HTTP cache because
 * they're already cheap and offer poor ROI for the bookkeeping cost.
 */
export const CACHED_ASSETS: readonly string[] = [
  // 3D models
  'assets/models/samumask.glb',
  'assets/models/standingsamurai.glb',

  // Hero video
  'assets/videos/vader.mp4',

  // Portfolio slides — Three.js TextureLoader pulls these in succession
  // during the slider build, so caching them avoids visible pop-in.
  ...PORTFOLIO_HERO.map(name => `assets/images/portfolio/${name}`),
  ...PORTFOLIO_FRAMES.map(name => `assets/images/portfolio/${name}`),
];
