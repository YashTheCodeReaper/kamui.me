import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

/**
 * One-time per-session notice shown when the site loads on a small portrait
 * device. Dismissal is remembered in sessionStorage; rotating to landscape
 * also hides the notice automatically.
 *
 * Trigger combines `(orientation: portrait)` with a width ceiling so a
 * 27" portrait desktop monitor or a tall-but-wide tablet doesn't get
 * pestered — only phones and small tablets do.
 */
const STORAGE_KEY = 'kamui:orientation-notice-dismissed';
const PORTRAIT_QUERY = '(orientation: portrait) and (max-width: 900px)';

@Component({
  selector: 'app-orientation-notice',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="orientation-notice"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="orientation-notice-title"
      >
        <div class="orientation-notice__card ff_nhg">
          <div class="orientation-notice__icon" aria-hidden="true">
            <i class="fi fi-ss-rotate-right"></i>
          </div>
          <h2 id="orientation-notice-title">
            <span>P</span>ortrait <span>m</span>ode
          </h2>
          <p class="ff_mb">
            This site isn't fully optimized for portrait yet. Rotate your device
            to landscape for the best experience, or continue anyway.
          </p>
          <button
            type="button"
            class="orientation-notice__cta ff_mb"
            (click)="dismiss()"
          >
            Continue anyway
          </button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .orientation-notice {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background-color: rgba(0, 0, 0, 0.88);
        backdrop-filter: blur(0.6rem);
        -webkit-backdrop-filter: blur(0.6rem);
        animation: orientation-notice-fade-in 220ms ease-out both;
      }

      .orientation-notice__card {
        max-width: 34rem;
        width: 100%;
        padding: 3rem 2.4rem;
        border-radius: 1.2rem;
        background-color: var(--main-1);
        color: var(--main-3);
        text-align: center;
        box-shadow: 0 1.6rem 3.6rem rgba(0, 0, 0, 0.55);
      }

      .orientation-notice__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 4.8rem;
        height: 4.8rem;
        margin-bottom: 1.6rem;
        border-radius: 50%;
        background-color: var(--main-2);
        color: var(--main-1);

        i {
          font-size: 2rem;
          /* The sales-pitch wink: gently nudge the user toward rotating. */
          animation: orientation-notice-rotate 2.4s ease-in-out infinite;
        }
      }

      .orientation-notice__card {
        h2 {
          font-size: clamp(2.4rem, 9vw, 3.2rem);
          font-weight: 1000;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: -0.05rem;

          span {
            color: var(--main-2);
          }
        }

        p {
          font-size: 1.3rem;
          line-height: 1.5;
          margin-bottom: 2.2rem;
          opacity: 0.85;
        }
      }

      .orientation-notice__cta {
        display: inline-block;
        padding: 1rem 2.2rem;
        font-size: 1.2rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        background-color: var(--main-2);
        color: var(--main-1);
        border: none;
        border-radius: 0.6rem;
        cursor: pointer;
        transition: transform 200ms ease, box-shadow 200ms ease;

        &:hover {
          transform: translateY(-0.2rem);
          box-shadow: 0 0.6rem 1.6rem rgba(0, 0, 0, 0.3);
        }

        &:focus-visible {
          outline: 0.2rem solid var(--main-2);
          outline-offset: 0.4rem;
        }
      }

      @keyframes orientation-notice-fade-in {
        from {
          opacity: 0;
          transform: scale(1.02);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes orientation-notice-rotate {
        0%,
        15% {
          transform: rotate(0deg);
        }
        45%,
        60% {
          transform: rotate(90deg);
        }
        90%,
        100% {
          transform: rotate(0deg);
        }
      }
    `,
  ],
})
export class OrientationNoticeComponent implements OnInit, OnDestroy {
  protected readonly visible = signal(false);

  private mediaQuery?: MediaQueryList;
  private mediaListener?: (event: MediaQueryListEvent) => void;

  ngOnInit(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    this.mediaQuery = window.matchMedia(PORTRAIT_QUERY);
    this.mediaListener = (event: MediaQueryListEvent): void => {
      this.evaluate(event.matches);
    };
    this.mediaQuery.addEventListener('change', this.mediaListener);
    this.evaluate(this.mediaQuery.matches);
  }

  ngOnDestroy(): void {
    if (this.mediaQuery && this.mediaListener) {
      this.mediaQuery.removeEventListener('change', this.mediaListener);
    }
  }

  protected dismiss(): void {
    this.rememberDismissal();
    this.visible.set(false);
  }

  /** Open question for the user: hide if landscape OR previously dismissed. */
  private evaluate(isPortrait: boolean): void {
    if (!isPortrait || this.wasDismissed()) {
      this.visible.set(false);
      return;
    }
    this.visible.set(true);
  }

  private wasDismissed(): boolean {
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      // sessionStorage can throw in private/incognito modes — fail open.
      return false;
    }
  }

  private rememberDismissal(): void {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* sessionStorage unavailable — dismissal lasts only this view */
    }
  }
}
