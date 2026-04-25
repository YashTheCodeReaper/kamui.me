/**
 * Smooth-scroll helpers that prefer Lenis (when the global vendor script has
 * initialised it on `window`) and gracefully fall back to native APIs.
 *
 * `lenis.init.js` exposes the instance as `window.lenis`. We type it as
 * `unknown` and feature-detect, so missing/late-loading Lenis never throws.
 */

interface LenisLike {
  scrollTo(
    target: string | number | HTMLElement,
    options?: { offset?: number; duration?: number; immediate?: boolean },
  ): void;
}

const getLenis = (): LenisLike | undefined => {
  if (typeof window === 'undefined') return undefined;
  const candidate = (window as unknown as { lenis?: unknown }).lenis;
  if (
    candidate &&
    typeof (candidate as { scrollTo?: unknown }).scrollTo === 'function'
  ) {
    return candidate as LenisLike;
  }
  return undefined;
};

/**
 * Scroll the page to the element matching `selector`. No-op if the element
 * doesn't exist (e.g. menu wired for a section that hasn't been built yet).
 */
export const scrollToSection = (selector: string): void => {
  if (typeof document === 'undefined') return;

  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return;

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { offset: 0 });
    return;
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/** Scroll to absolute top — used by the header brand. */
export const scrollToTop = (): void => {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, { offset: 0 });
    return;
  }
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
