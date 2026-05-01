import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';

import { FluidCursorRenderer } from './fluid-cursor.renderer';

/**
 * Feature flag — set to disable the fluid cursor for a single visitor on
 * any machine where it misbehaves. Two ways to enable:
 *
 *   localStorage.setItem('kamui:disable-fluid-cursor', '1')
 *   ?disable-fluid-cursor=1   in the URL
 *
 * Useful as an escape hatch while we're iterating on the feature-detection
 * heuristics below. Cleared by removing the flag / leaving the param off.
 */
const KILL_SWITCH_STORAGE_KEY = 'kamui:disable-fluid-cursor';
const KILL_SWITCH_QUERY_PARAM = 'disable-fluid-cursor';

@Component({
  selector: 'app-fluid-cursor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas class="fluid-cursor-canvas" aria-hidden="true"></canvas>`,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 50;
        /* The display pass writes a luminance mask; difference blending turns
           that into a per-pixel inversion of whatever's behind the trail. */
        mix-blend-mode: difference;
      }

      /* Touch devices have no hover-tracked pointer — the trail just smears
         under finger taps and burns GPU. Hide the host entirely. */
      @media (hover: none) and (pointer: coarse) {
        :host {
          display: none;
        }
      }

      .fluid-cursor-canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ],
})
export class FluidCursorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private renderer?: FluidCursorRenderer;

  ngAfterViewInit(): void {
    // Hard pre-flight — every environment that can't render the effect
    // correctly bails out *before* we mount a WebGL context. Otherwise a
    // partially-supported browser (no mix-blend-mode, no float textures)
    // would paint a solid-white canvas over the whole page.
    const reason = this.environmentReasonToDisable();
    if (reason) {
      console.info(`[FluidCursor] disabled — ${reason}`);
      this.hostRef.nativeElement.style.display = 'none';
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    try {
      this.renderer = new FluidCursorRenderer(canvas);
      this.renderer.attachResize();
      this.renderer.start();
    } catch (err) {
      // Gracefully degrade if WebGL initialisation fails.
      console.warn('[FluidCursor] disabled — renderer init threw', err);
      this.hostRef.nativeElement.style.display = 'none';
    }
  }

  ngOnDestroy(): void {
    this.renderer?.dispose();
  }

  @HostListener('window:pointermove', ['$event'])
  protected onPointerMove(event: PointerEvent): void {
    if (!this.renderer) return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const { clientX, clientY } = event;

    // Skip work entirely while the pointer is outside the host's bounds
    // (e.g. once the user has scrolled past the home section).
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      this.renderer.pointerReset();
      return;
    }

    this.renderer.pointerMove(clientX - rect.left, clientY - rect.top);
  }

  @HostListener('window:pointerleave')
  protected onPointerLeave(): void {
    this.renderer?.pointerReset();
  }

  /**
   * Returns a non-null string explaining why the fluid cursor must be
   * disabled, or `null` when every prerequisite check passes. Centralised
   * so the disable reason is logged consistently and so the user / on-call
   * can grep it from a console screenshot.
   *
   * Order matters — cheap checks first, expensive (creates a probe canvas)
   * last so we don't allocate a context on already-doomed environments.
   */
  private environmentReasonToDisable(): string | null {
    if (typeof window === 'undefined') return 'no window (SSR)';

    if (this.isTouchOnly()) return 'touch-only device';

    if (this.killSwitchEngaged()) return 'kill switch engaged';

    if (!this.supportsBlendMode()) {
      // Without `mix-blend-mode: difference` the white luminance mask would
      // paint on top of the page as opaque white. This was the original
      // "site goes white" bug on browsers with the property unsupported or
      // hardware-acceleration disabled.
      return 'mix-blend-mode: difference unsupported';
    }

    const webglReason = this.checkWebGlSupport();
    if (webglReason) return webglReason;

    return null;
  }

  private isTouchOnly(): boolean {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: none) and (pointer: coarse)').matches
    );
  }

  private killSwitchEngaged(): boolean {
    try {
      if (window.localStorage.getItem(KILL_SWITCH_STORAGE_KEY) === '1') {
        return true;
      }
    } catch {
      /* storage may be blocked — treat as not engaged */
    }
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get(KILL_SWITCH_QUERY_PARAM) === '1') return true;
    } catch {
      /* malformed URL — ignore */
    }
    return false;
  }

  private supportsBlendMode(): boolean {
    if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
      // Old browser without CSS.supports — assume the worst rather than
      // risk the white-screen failure mode.
      return false;
    }
    return CSS.supports('mix-blend-mode', 'difference');
  }

  /**
   * The fluid sim writes into half-float (or full-float) render targets —
   * Navier-Stokes with byte precision is unstable. We need a context that
   * advertises one of:
   *
   *   • WebGL2                                          (linear-filtered float
   *                                                      textures are core)
   *   • WebGL1 + OES_texture_half_float                 (half-float storage)
   *
   * If neither is present, the simulation produces garbage values and the
   * canvas can flash to opaque white as the dye texture saturates.
   *
   * Returns a reason string when unsupported, `null` when OK.
   */
  private checkWebGlSupport(): string | null {
    let probe: HTMLCanvasElement | null = null;
    try {
      probe = document.createElement('canvas');
      const gl2 = probe.getContext('webgl2');
      if (gl2) {
        // WebGL2 always has half-float render targets via EXT_color_buffer_half_float
        // (a guaranteed extension on every WebGL2-compliant implementation).
        const ext = gl2.getExtension('EXT_color_buffer_half_float');
        return ext ? null : 'WebGL2 lacks EXT_color_buffer_half_float';
      }

      const gl1 = (probe.getContext('webgl') ||
        probe.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (!gl1) return 'no WebGL support';

      const halfFloat = gl1.getExtension('OES_texture_half_float');
      if (!halfFloat) return 'WebGL1 lacks OES_texture_half_float';

      return null;
    } catch (err) {
      return `WebGL probe threw: ${(err as Error).message}`;
    } finally {
      // Probe canvas is detached; let GC reclaim the context.
      probe = null;
    }
  }
}
