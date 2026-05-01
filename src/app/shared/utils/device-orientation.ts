/**
 * Cross-platform `deviceorientation` plumbing. Resolves the iOS 13+
 * permission ceremony (which has to be triggered from inside a user
 * gesture) and exposes a single subscribe helper for everything else.
 *
 * Returned `unsubscribe` cleanly removes the listener and clears any
 * pending permission requests so callers can attach/detach across
 * component lifecycles without leaking handlers.
 */

type WithRequestPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
};

/**
 * `true` for devices that plausibly have a tilt sensor.
 *
 * The naive check — `matchMedia('(hover: none) and (pointer: coarse)')`
 * — silently misclassifies **iPad**: iPadOS 13+ ships "Request Desktop
 * Website" on by default, so Safari reports `(hover: hover)` and
 * `(pointer: fine)`. The gate fails, gyro never attaches, the mask
 * stays frozen.
 *
 * Detection in priority order:
 *
 *   1. `DeviceOrientationEvent.requestPermission` exists
 *      → iOS / iPadOS 13+. The sensor is definitely present; the
 *        permission flow is the only barrier (handled in `subscribe…`).
 *   2. The OS reports any touch hardware
 *      (`navigator.maxTouchPoints > 0` or `'ontouchstart' in window`)
 *      → Android tablet/phone, or a 2-in-1 laptop. Plausible sensor;
 *        attaching is cheap (one passive listener that simply never
 *        fires if the hardware isn't there).
 *   3. Anything else
 *      → desktop without a touch screen; skip.
 */
export const supportsDeviceOrientation = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (typeof window.DeviceOrientationEvent === 'undefined') return false;

  if (requiresPermission()) {
    // iOS / iPadOS — the sensor is guaranteed to exist on hardware that
    // ships this constructor. `Request Desktop Website` doesn't strip
    // `DeviceOrientationEvent.requestPermission` from the ctor, so this
    // remains the most reliable iPad signal.
    return true;
  }

  if (typeof navigator !== 'undefined') {
    if (navigator.maxTouchPoints > 0) return true;
  }
  return 'ontouchstart' in window;
};

const requiresPermission = (): boolean => {
  const ctor = window.DeviceOrientationEvent as WithRequestPermission;
  return typeof ctor?.requestPermission === 'function';
};

const askForPermission = async (): Promise<boolean> => {
  const ctor = window.DeviceOrientationEvent as WithRequestPermission;
  if (!ctor.requestPermission) return true;
  try {
    const result = await ctor.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
};

export interface OrientationSample {
  /** Front-back tilt, -180..180 (90 ≈ device upright facing user). */
  readonly beta: number;
  /** Left-right tilt, -90..90 (0 = flat to user, +/- = lean). */
  readonly gamma: number;
}

export type OrientationListener = (sample: OrientationSample) => void;

/**
 * Subscribe to device orientation. On iOS the permission prompt is
 * deferred to the next user gesture (touch or click on `window`) since
 * Safari refuses programmatic prompts. Other browsers attach immediately.
 *
 * Returns an `unsubscribe` callback that's always safe to call (even
 * before the listener is fully attached, e.g. while we're still waiting
 * on the iOS user gesture).
 */
export const subscribeToDeviceOrientation = (
  listener: OrientationListener,
): (() => void) => {
  if (!supportsDeviceOrientation()) return () => {};

  let active = true;
  let attached = false;
  let pendingGestureCleanup: (() => void) | undefined;

  const handler = (event: DeviceOrientationEvent): void => {
    if (!active) return;
    listener({
      beta: event.beta ?? 0,
      gamma: event.gamma ?? 0,
    });
  };

  const attachNow = (): void => {
    if (!active || attached) return;
    window.addEventListener('deviceorientation', handler, { passive: true });
    attached = true;
  };

  if (requiresPermission()) {
    // Safari refuses to even attach the listener until the user has
    // explicitly opted in. Defer the request to the next tap so we
    // satisfy the user-gesture requirement.
    const requestOnGesture = (): void => {
      askForPermission().then((granted) => {
        if (granted) attachNow();
      });
      pendingGestureCleanup?.();
    };
    window.addEventListener('touchstart', requestOnGesture, { once: true, passive: true });
    window.addEventListener('click', requestOnGesture, { once: true, passive: true });
    pendingGestureCleanup = () => {
      window.removeEventListener('touchstart', requestOnGesture);
      window.removeEventListener('click', requestOnGesture);
      pendingGestureCleanup = undefined;
    };
  } else {
    attachNow();
  }

  return () => {
    active = false;
    if (attached) window.removeEventListener('deviceorientation', handler);
    pendingGestureCleanup?.();
  };
};
