/**
 * Three.js infinite vertical image slider with curl-on-scroll deformation.
 *
 * Each slide is a `PlaneGeometry` arranged in a stack along Y. Wheel/drag/
 * touch input drives a smoothed `scrollPosition`; the per-frame frame-delta
 * feeds a velocity-based distortion target that bends each plane along Z
 * (radial falloff from each plane's centre). Positions wrap modulo
 * `loopLength` so the stack scrolls forever in either direction.
 *
 * Direct port of the Codegrid "ThreeJS Infinite Slider" demo, rewritten to
 * be host-scoped (events bound to the slider section, not window) and
 * cleanly disposable for Angular's lifecycle.
 */

import * as THREE from 'three';

export interface PortfolioSlide {
  readonly name: string;
  readonly img: string;
}

export interface PortfolioSliderConfig {
  readonly minHeight: number;
  readonly maxHeight: number;
  readonly aspectRatio: number;
  readonly gap: number;
  readonly smoothing: number;
  readonly distortionStrength: number;
  readonly distortionSmoothing: number;
  readonly momentumFriction: number;
  readonly momentumThreshold: number;
  readonly wheelSpeed: number;
  readonly wheelMax: number;
  readonly dragSpeed: number;
  readonly dragMomentum: number;
  readonly touchSpeed: number;
  readonly touchMomentum: number;
}

const DEFAULT_CONFIG: PortfolioSliderConfig = {
  minHeight: 1,
  maxHeight: 1.5,
  aspectRatio: 1,
  gap: 0.05,
  smoothing: 0.05,
  distortionStrength: 2.5,
  distortionSmoothing: 0.1,
  momentumFriction: 0.95,
  momentumThreshold: 0.001,
  wheelSpeed: 0.01,
  wheelMax: 150,
  dragSpeed: 0.01,
  dragMomentum: 0.01,
  touchSpeed: 0.01,
  touchMomentum: 0.1,
};

interface SlideMesh {
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  readonly originalVertices: Float32Array;
  readonly offset: number;
  readonly index: number;
}

const wrap = (value: number, range: number): number => ((value % range) + range) % range;

export class PortfolioSliderRenderer {
  private readonly config: PortfolioSliderConfig;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly slideMeshes: SlideMesh[] = [];
  private readonly loopLength: number;
  private readonly halfLoop: number;

  // Smoothed scroll state
  private scrollPosition = 0;
  private scrollTarget = 0;
  private scrollMomentum = 0;
  private isScrolling = false;
  private scrollTimeout = 0;
  private dragMomentumTimeout = 0;
  private touchMomentumTimeout = 0;

  // Distortion state
  private distortionAmount = 0;
  private distortionTarget = 0;
  private velocityPeak = 0;
  private scrollDirection = 0;
  private directionTarget = 0;
  private readonly velocityHistory = [0, 0, 0, 0, 0];

  // Pointer/touch state
  private isDragging = false;
  private dragStartY = 0;
  private dragDelta = 0;
  private touchStartY = 0;
  private touchLastY = 0;

  private activeSlideIndex = -1;
  private lastFrameTime = 0;
  private rafHandle = 0;
  private disposed = false;
  private resizeObserver?: ResizeObserver;

  // Bound listener references (kept stable for removeEventListener)
  private readonly onWheel = (e: WheelEvent): void => this.handleWheel(e);
  private readonly onMouseDown = (e: MouseEvent): void => this.handleMouseDown(e);
  private readonly onMouseMove = (e: MouseEvent): void => this.handleMouseMove(e);
  private readonly onMouseUp = (): void => this.handleMouseUp();
  private readonly onTouchStart = (e: TouchEvent): void => this.handleTouchStart(e);
  private readonly onTouchMove = (e: TouchEvent): void => this.handleTouchMove(e);
  private readonly onTouchEnd = (): void => this.handleTouchEnd();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly host: HTMLElement,
    private readonly slides: readonly PortfolioSlide[],
    private readonly onActiveSlideChange: (index: number, slide: PortfolioSlide) => void,
    config: Partial<PortfolioSliderConfig> = {},
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    // Fully transparent clear so whatever is behind the section shows through.
    this.renderer.setClearColor(0x000000, 0);

    // No `scene.background` — leaving it null keeps the canvas transparent.
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.z = 5;

    this.measureAndResize();

    // Random per-slide heights produce the "varied stack" rhythm of the demo.
    const total = slides.length;
    const heights = Array.from(
      { length: total },
      () => this.config.minHeight + Math.random() * (this.config.maxHeight - this.config.minHeight),
    );

    // Pack the slides linearly so each plane's centre = previous bottom + gap + h/2.
    const offsets: number[] = [];
    let stack = 0;
    for (let i = 0; i < total; i++) {
      if (i === 0) {
        offsets.push(0);
        stack = heights[0] / 2;
      } else {
        stack += this.config.gap + heights[i] / 2;
        offsets.push(stack);
        stack += heights[i] / 2;
      }
    }
    this.loopLength = stack + this.config.gap + heights[0] / 2;
    this.halfLoop = this.loopLength / 2;

    const loader = new THREE.TextureLoader();
    for (let i = 0; i < total; i++) {
      const h = heights[i];
      const w = h * this.config.aspectRatio;
      const geometry = new THREE.PlaneGeometry(w, h, 32, 16);
      const material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        color: 0x999999,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const original = new Float32Array(geometry.attributes['position'].array);

      this.scene.add(mesh);
      this.slideMeshes.push({
        mesh,
        originalVertices: original,
        offset: offsets[i],
        index: i,
      });

      loader.load(slides[i].img, texture => {
        if (this.disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.color.set(0xffffff);
        material.needsUpdate = true;

        // Cover-fit the texture inside the plane: scale down whichever axis
        // would have been over-stretched so the image isn't squashed.
        const imageAspect = texture.image.width / texture.image.height;
        const planeAspect = w / h;
        const ratio = imageAspect / planeAspect;
        if (ratio > 1) mesh.scale.y = 1 / ratio;
        else mesh.scale.x = ratio;
      });
    }
  }

  start(): void {
    this.attachListeners();
    this.lastFrameTime = 0;
    const tick = (time: number): void => {
      if (this.disposed) return;
      this.rafHandle = requestAnimationFrame(tick);
      this.frame(time);
    };
    this.rafHandle = requestAnimationFrame(tick);
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.rafHandle);
    clearTimeout(this.scrollTimeout);
    clearTimeout(this.dragMomentumTimeout);
    clearTimeout(this.touchMomentumTimeout);
    this.detachListeners();
    this.resizeObserver?.disconnect();

    for (const slide of this.slideMeshes) {
      slide.mesh.geometry.dispose();
      slide.mesh.material.map?.dispose();
      slide.mesh.material.dispose();
    }
    this.renderer.dispose();
  }

  // ---- input ---------------------------------------------------------------

  private attachListeners(): void {
    this.canvas.style.cursor = 'grab';
    // `passive: false` so we can preventDefault wheel/touchmove and stop the
    // page from scrolling underneath the slider while it's being interacted with.
    this.host.addEventListener('wheel', this.onWheel, { passive: false });
    this.host.addEventListener('mousedown', this.onMouseDown);
    this.host.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.host.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.host.addEventListener('touchend', this.onTouchEnd);
    // Drag moves and releases must follow the cursor even outside the host.
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);

    this.resizeObserver = new ResizeObserver(() => this.measureAndResize());
    this.resizeObserver.observe(this.canvas);
  }

  private detachListeners(): void {
    this.host.removeEventListener('wheel', this.onWheel);
    this.host.removeEventListener('mousedown', this.onMouseDown);
    this.host.removeEventListener('touchstart', this.onTouchStart);
    this.host.removeEventListener('touchmove', this.onTouchMove);
    this.host.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    const clamped = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), this.config.wheelMax);
    this.addDistortionBurst(Math.abs(clamped) * 0.001);
    this.scrollTarget += clamped * this.config.wheelSpeed;
    this.isScrolling = true;
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = window.setTimeout(() => (this.isScrolling = false), 150);
  }

  private handleMouseDown(e: MouseEvent): void {
    this.isDragging = true;
    this.dragStartY = e.clientY;
    this.dragDelta = 0;
    this.scrollMomentum = 0;
    this.canvas.style.cursor = 'grabbing';
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    const deltaY = e.clientY - this.dragStartY;
    this.dragStartY = e.clientY;
    this.dragDelta = deltaY;
    this.addDistortionBurst(Math.abs(deltaY) * 0.02);
    this.scrollTarget -= deltaY * this.config.dragSpeed;
    this.isScrolling = true;
  }

  private handleMouseUp(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.canvas.style.cursor = 'grab';
    if (Math.abs(this.dragDelta) > 2) {
      this.scrollMomentum = -this.dragDelta * this.config.dragMomentum;
      this.addDistortionBurst(Math.abs(this.dragDelta) * 0.005);
      this.isScrolling = true;
      clearTimeout(this.dragMomentumTimeout);
      this.dragMomentumTimeout = window.setTimeout(() => (this.isScrolling = false), 800);
    }
  }

  private handleTouchStart(e: TouchEvent): void {
    this.touchStartY = this.touchLastY = e.touches[0].clientY;
    this.isScrolling = false;
    this.scrollMomentum = 0;
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();
    const cy = e.touches[0].clientY;
    const deltaY = cy - this.touchLastY;
    this.touchLastY = cy;
    this.addDistortionBurst(Math.abs(deltaY) * 0.02);
    this.scrollTarget -= deltaY * this.config.touchSpeed;
    this.isScrolling = true;
  }

  private handleTouchEnd(): void {
    const swipeVelocity = (this.touchLastY - this.touchStartY) * 0.005;
    if (Math.abs(swipeVelocity) > 0.5) {
      this.scrollMomentum = -swipeVelocity * this.config.touchMomentum;
      this.addDistortionBurst(Math.abs(swipeVelocity) * 0.45);
      this.isScrolling = true;
      clearTimeout(this.touchMomentumTimeout);
      this.touchMomentumTimeout = window.setTimeout(() => (this.isScrolling = false), 800);
    }
  }

  private addDistortionBurst(amount: number): void {
    this.distortionTarget = Math.min(1, this.distortionTarget + amount);
  }

  // ---- frame ---------------------------------------------------------------

  private measureAndResize(): void {
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private applyDistortion(slide: SlideMesh, positionY: number, strength: number): void {
    const positions = slide.mesh.geometry.attributes['position'];
    const original = slide.originalVertices;
    for (let i = 0; i < positions.count; i++) {
      const x = original[i * 3];
      const y = original[i * 3 + 1];
      const dy = positionY + y;
      const distance = Math.sqrt(x * x + dy * dy);
      const falloff = Math.max(0, 1 - distance / 2);
      const bend = Math.pow(Math.sin((falloff * Math.PI) / 2), 1.5);
      positions.setZ(i, bend * strength);
    }
    positions.needsUpdate = true;
    slide.mesh.geometry.computeVertexNormals();
  }

  private frame(time: number): void {
    const deltaTime = this.lastFrameTime ? (time - this.lastFrameTime) / 1000 : 0.016;
    this.lastFrameTime = time;

    const previous = this.scrollPosition;

    if (this.isScrolling) {
      this.scrollTarget += this.scrollMomentum;
      this.scrollMomentum *= this.config.momentumFriction;
      if (Math.abs(this.scrollMomentum) < this.config.momentumThreshold) this.scrollMomentum = 0;
    }
    this.scrollPosition += (this.scrollTarget - this.scrollPosition) * this.config.smoothing;

    const frameDelta = this.scrollPosition - previous;
    if (Math.abs(frameDelta) > 0.00001) this.directionTarget = frameDelta > 0 ? 1 : -1;
    this.scrollDirection += (this.directionTarget - this.scrollDirection) * 0.08;

    const velocity = Math.abs(frameDelta) / deltaTime;
    this.velocityHistory.push(velocity);
    this.velocityHistory.shift();
    const avg = this.velocityHistory.reduce((a, b) => a + b, 0) / this.velocityHistory.length;

    if (avg > this.velocityPeak) this.velocityPeak = avg;
    const decelerating = avg / (this.velocityPeak + 0.001) < 0.7 && this.velocityPeak > 0.5;
    this.velocityPeak *= 0.99;

    if (velocity > 0.05) {
      this.distortionTarget = Math.max(this.distortionTarget, Math.min(1, velocity * 0.1));
    }
    if (decelerating || avg < 0.2) {
      this.distortionTarget *= decelerating ? 0.95 : 0.855;
    }

    this.distortionAmount +=
      (this.distortionTarget - this.distortionAmount) * this.config.distortionSmoothing;

    const signedDistortion = this.distortionAmount * this.scrollDirection;

    let closestDistance = Infinity;
    let closestIndex = 0;

    for (const slide of this.slideMeshes) {
      let y = -(slide.offset - wrap(this.scrollPosition, this.loopLength));
      y = wrap(y + this.halfLoop, this.loopLength) - this.halfLoop;
      slide.mesh.position.y = y;

      if (Math.abs(y) < closestDistance) {
        closestDistance = Math.abs(y);
        closestIndex = slide.index;
      }

      if (Math.abs(y) < this.halfLoop + this.config.maxHeight) {
        this.applyDistortion(slide, y, this.config.distortionStrength * signedDistortion);
      }
    }

    if (closestIndex !== this.activeSlideIndex) {
      this.activeSlideIndex = closestIndex;
      this.onActiveSlideChange(closestIndex, this.slides[closestIndex]);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
