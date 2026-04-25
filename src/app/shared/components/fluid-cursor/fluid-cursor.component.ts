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
    const canvas = this.canvasRef.nativeElement;
    try {
      this.renderer = new FluidCursorRenderer(canvas);
      this.renderer.attachResize();
      this.renderer.start();
    } catch (err) {
      // Gracefully degrade if WebGL initialisation fails.
      console.warn('[FluidCursor] disabled', err);
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
}
