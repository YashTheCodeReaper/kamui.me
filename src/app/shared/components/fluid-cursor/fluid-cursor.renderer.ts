/**
 * Real-time 2D fluid simulation (Navier–Stokes via Jacobi pressure solve)
 * driven by pointer motion. Pipeline per frame:
 *
 *   curl  →  vorticity confinement  →  divergence  →  pressure (Jacobi N×)
 *         →  gradient subtract       →  advect velocity & dye
 *
 * Pointer movement injects a velocity splat (signed by the cursor's
 * instantaneous velocity vector) and a white dye splat at the same point.
 * The display pass thresholds the dye into a luminance mask; combined with
 * `mix-blend-mode: difference` on the host, the trail reads as an inversion
 * of whatever is behind it.
 *
 * This is a direct TypeScript port of the reference Codegrid/Cappen demo.
 */

import * as THREE from 'three';

export interface FluidConfig {
  readonly simResolution: number;
  readonly dyeResolution: number;
  readonly curl: number;
  readonly pressureIterations: number;
  readonly velocityDissipation: number;
  readonly dyeDissipation: number;
  readonly splatRadius: number;
  readonly forceStrength: number;
  readonly pressureDecay: number;
  readonly threshold: number;
  readonly edgeSoftness: number;
  readonly inkColor: THREE.Color;
}

const DEFAULT_CONFIG: FluidConfig = {
  simResolution: 256,
  dyeResolution: 1024,
  curl: 50,
  pressureIterations: 40,
  velocityDissipation: 0.95,
  dyeDissipation: 0.95,
  splatRadius: 0.3,
  forceStrength: 8.5,
  pressureDecay: 0.75,
  threshold: 1.0,
  edgeSoftness: 0.0,
  // Pure white ink. With `mix-blend-mode: difference` on the host, the trail
  // becomes `|backdrop − 1|` — a clean per-pixel inversion. Dark areas read
  // light, light areas read dark, with no hue shift. This is the "light↔dark
  // mode swap" look applied locally wherever the dye exists.
  inkColor: new THREE.Color(1, 1, 1),
};

interface DoubleTarget {
  read: THREE.WebGLRenderTarget;
  write: THREE.WebGLRenderTarget;
  swap(): void;
}

interface Materials {
  readonly splat: THREE.ShaderMaterial;
  readonly advection: THREE.ShaderMaterial;
  readonly divergence: THREE.ShaderMaterial;
  readonly curl: THREE.ShaderMaterial;
  readonly vorticity: THREE.ShaderMaterial;
  readonly pressure: THREE.ShaderMaterial;
  readonly gradientSubtract: THREE.ShaderMaterial;
  readonly clear: THREE.ShaderMaterial;
  readonly display: THREE.ShaderMaterial;
}

const VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.); }`;
const PRECISION = /* glsl */ `precision highp float;`;
const SAMPLER_PRECISION = /* glsl */ `precision mediump sampler2D;`;

const SHADERS = {
  splat: [
    VERT,
    `${PRECISION} ${SAMPLER_PRECISION}
    uniform sampler2D uTarget; uniform float aspectRatio,radius; uniform vec3 color; uniform vec2 point; varying vec2 vUv;
    void main(){ vec2 p=vUv-point; p.x*=aspectRatio; gl_FragColor=vec4(texture2D(uTarget,vUv).xyz+exp(-dot(p,p)/radius)*color,1.); }`,
  ],
  advection: [
    VERT,
    `${PRECISION} ${SAMPLER_PRECISION}
    uniform sampler2D uVelocity,uSource; uniform vec2 texelSize; uniform float dt,dissipation; varying vec2 vUv;
    void main(){ gl_FragColor=vec4(dissipation*texture2D(uSource,vUv-dt*texture2D(uVelocity,vUv).xy*texelSize).rgb,1.); }`,
  ],
  divergence: [
    VERT,
    `${PRECISION} ${SAMPLER_PRECISION}
    uniform sampler2D uVelocity; uniform vec2 texelSize; varying vec2 vUv;
    vec2 vel(vec2 uv){ vec2 e=vec2(1.); if(uv.x<0.){uv.x=0.;e.x=-1.;} if(uv.x>1.){uv.x=1.;e.x=-1.;} if(uv.y<0.){uv.y=0.;e.y=-1.;} if(uv.y>1.){uv.y=1.;e.y=-1.;} return e*texture2D(uVelocity,uv).xy; }
    void main(){ vec2 L=vUv-vec2(texelSize.x,0.),R=vUv+vec2(texelSize.x,0.),T=vUv+vec2(0.,texelSize.y),B=vUv-vec2(0.,texelSize.y); gl_FragColor=vec4(.5*(vel(R).x-vel(L).x+vel(T).y-vel(B).y),0.,0.,1.); }`,
  ],
  curl: [
    VERT,
    `${PRECISION} ${SAMPLER_PRECISION}
    uniform sampler2D uVelocity; uniform vec2 texelSize; varying vec2 vUv;
    void main(){ vec2 L=vUv-vec2(texelSize.x,0.),R=vUv+vec2(texelSize.x,0.),T=vUv+vec2(0.,texelSize.y),B=vUv-vec2(0.,texelSize.y); gl_FragColor=vec4(texture2D(uVelocity,R).y-texture2D(uVelocity,L).y-texture2D(uVelocity,T).x+texture2D(uVelocity,B).x,0.,0.,1.); }`,
  ],
  vorticity: [
    VERT,
    `${PRECISION} ${SAMPLER_PRECISION}
    uniform sampler2D uVelocity,uCurl; uniform vec2 texelSize; uniform float curlStrength,dt; varying vec2 vUv;
    void main(){ vec2 L=vUv-vec2(texelSize.x,0.),R=vUv+vec2(texelSize.x,0.),T=vUv+vec2(0.,texelSize.y),B=vUv-vec2(0.,texelSize.y); vec2 f=normalize(vec2(abs(texture2D(uCurl,T).x)-abs(texture2D(uCurl,B).x),abs(texture2D(uCurl,R).x)-abs(texture2D(uCurl,L).x))+.0001)*curlStrength*texture2D(uCurl,vUv).x; gl_FragColor=vec4(texture2D(uVelocity,vUv).xy+f*dt,0.,1.); }`,
  ],
  pressure: [
    VERT,
    `${PRECISION} ${SAMPLER_PRECISION}
    uniform sampler2D uPressure,uDivergence; uniform vec2 texelSize; varying vec2 vUv;
    void main(){ vec2 L=clamp(vUv-vec2(texelSize.x,0.),0.,1.),R=clamp(vUv+vec2(texelSize.x,0.),0.,1.),T=clamp(vUv+vec2(0.,texelSize.y),0.,1.),B=clamp(vUv-vec2(0.,texelSize.y),0.,1.); gl_FragColor=vec4((texture2D(uPressure,L).x+texture2D(uPressure,R).x+texture2D(uPressure,T).x+texture2D(uPressure,B).x-texture2D(uDivergence,vUv).x)*.25,0.,0.,1.); }`,
  ],
  gradientSubtract: [
    VERT,
    `${PRECISION} ${SAMPLER_PRECISION}
    uniform sampler2D uPressure,uVelocity; uniform vec2 texelSize; varying vec2 vUv;
    void main(){ float pL=texture2D(uPressure,clamp(vUv-vec2(texelSize.x,0.),0.,1.)).x,pR=texture2D(uPressure,clamp(vUv+vec2(texelSize.x,0.),0.,1.)).x,pT=texture2D(uPressure,clamp(vUv+vec2(0.,texelSize.y),0.,1.)).x,pB=texture2D(uPressure,clamp(vUv-vec2(0.,texelSize.y),0.,1.)).x; gl_FragColor=vec4(texture2D(uVelocity,vUv).xy-vec2(pR-pL,pT-pB),0.,1.); }`,
  ],
  clear: [
    VERT,
    `${PRECISION} ${SAMPLER_PRECISION}
    uniform sampler2D uTexture; uniform float value; varying vec2 vUv;
    void main(){ gl_FragColor=value*texture2D(uTexture,vUv); }`,
  ],
  display: [
    VERT,
    `${PRECISION}
    uniform sampler2D uTexture; uniform float threshold,edgeSoftness; uniform vec3 inkColor; varying vec2 vUv;
    void main(){ float d=clamp(length(texture2D(uTexture,vUv).rgb),0.,1.); float a=edgeSoftness>0.?smoothstep(threshold-edgeSoftness*.5,threshold+edgeSoftness*.5,d):step(threshold,d); gl_FragColor=vec4(inkColor,a); }`,
  ],
} as const;

export class FluidCursorRenderer {
  private readonly config: FluidConfig;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.OrthographicCamera;
  private readonly quad: THREE.Mesh;
  private readonly materials: Materials;

  private dpr = 1;
  private width = 0;
  private height = 0;
  private simSize = { w: 1, h: 1 };
  private dyeSize = { w: 1, h: 1 };

  private velocity!: DoubleTarget;
  private dye!: DoubleTarget;
  private divergence!: THREE.WebGLRenderTarget;
  private curlTarget!: THREE.WebGLRenderTarget;
  private pressure!: DoubleTarget;

  private mouse = { x: 0, y: 0, vx: 0, vy: 0, moved: false, primed: false };
  private animationHandle = 0;
  private lastTime = 0;
  private disposed = false;
  private visible = true;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;

  constructor(canvas: HTMLCanvasElement, config: Partial<FluidConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.dpr = this.renderer.getPixelRatio();
    this.measure();
    this.renderer.setSize(this.cssWidth(), this.cssHeight(), false);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.scene.add(this.quad);

    this.materials = this.buildMaterials();
    this.allocateTargets();
  }

  attachResize(): void {
    const handler = () => this.handleResize();
    this.resizeObserver = new ResizeObserver(handler);
    this.resizeObserver.observe(this.renderer.domElement);
    window.addEventListener('resize', handler);
    handler();
  }

  start(): void {
    this.lastTime = performance.now();
    // Pause the simulation when the canvas is fully off-screen — fluid-cursor
    // is host-fixed but the document tab itself can be hidden, and an off-page
    // canvas (e.g. zero-size during transitions) shouldn't burn GPU cycles.
    this.intersectionObserver = new IntersectionObserver(
      entries => {
        for (const entry of entries) this.visible = entry.isIntersecting;
      },
      { rootMargin: '20% 0px' },
    );
    this.intersectionObserver.observe(this.renderer.domElement);

    const tick = () => {
      if (this.disposed) return;
      this.animationHandle = requestAnimationFrame(tick);
      if (!this.visible || document.hidden) {
        // Reset clock so we don't get a giant dt jump when we resume.
        this.lastTime = performance.now();
        return;
      }
      this.frame();
    };
    tick();
  }

  /**
   * Push a pointer sample expressed in canvas-local CSS pixels (origin at the
   * canvas top-left). The renderer derives velocity from the previous sample.
   */
  pointerMove(localX: number, localY: number): void {
    const x = localX * this.dpr;
    const y = localY * this.dpr;
    if (!this.mouse.primed) {
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.vx = 0;
      this.mouse.vy = 0;
      this.mouse.primed = true;
      this.mouse.moved = true;
      return;
    }
    this.mouse.vx = (x - this.mouse.x) * this.config.forceStrength;
    this.mouse.vy = (y - this.mouse.y) * this.config.forceStrength;
    this.mouse.x = x;
    this.mouse.y = y;
    this.mouse.moved = true;
  }

  /** Pointer left the active region — drop velocity history so the next entry doesn't snap. */
  pointerReset(): void {
    this.mouse.primed = false;
    this.mouse.moved = false;
    this.mouse.vx = 0;
    this.mouse.vy = 0;
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.animationHandle);
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = undefined;
    Object.values(this.materials).forEach(m => m.dispose());
    this.disposeDouble(this.velocity);
    this.disposeDouble(this.dye);
    this.disposeDouble(this.pressure);
    this.divergence.dispose();
    this.curlTarget.dispose();
    this.quad.geometry.dispose();
    this.renderer.dispose();
  }

  // ---- internals -----------------------------------------------------------

  private cssWidth(): number {
    return this.renderer.domElement.clientWidth || 1;
  }

  private cssHeight(): number {
    return this.renderer.domElement.clientHeight || 1;
  }

  private measure(): void {
    this.width = Math.max(1, Math.floor(this.cssWidth() * this.dpr));
    this.height = Math.max(1, Math.floor(this.cssHeight() * this.dpr));
  }

  private handleResize(): void {
    this.measure();
    this.renderer.setSize(this.cssWidth(), this.cssHeight(), false);
    // Targets are bound to sim/dye resolutions, not screen size, so they stay
    // valid. The aspect uniform is passed per-splat from current width/height.
  }

  private buildMaterials(): Materials {
    const make = (
      sources: readonly [string, string],
      uniforms: Record<string, THREE.IUniform>,
    ): THREE.ShaderMaterial =>
      new THREE.ShaderMaterial({
        vertexShader: sources[0],
        fragmentShader: sources[1],
        uniforms,
      });
    const tex = (): THREE.IUniform => ({ value: null });
    const num = (v = 0): THREE.IUniform => ({ value: v });
    const v2 = (): THREE.IUniform => ({ value: new THREE.Vector2() });

    return {
      splat: make(SHADERS.splat, {
        uTarget: tex(),
        aspectRatio: num(),
        radius: num(),
        color: { value: new THREE.Vector3() },
        point: { value: new THREE.Vector2() },
      }),
      advection: make(SHADERS.advection, {
        uVelocity: tex(),
        uSource: tex(),
        texelSize: v2(),
        dt: num(),
        dissipation: num(),
      }),
      divergence: make(SHADERS.divergence, { uVelocity: tex(), texelSize: v2() }),
      curl: make(SHADERS.curl, { uVelocity: tex(), texelSize: v2() }),
      vorticity: make(SHADERS.vorticity, {
        uVelocity: tex(),
        uCurl: tex(),
        texelSize: v2(),
        curlStrength: num(),
        dt: num(),
      }),
      pressure: make(SHADERS.pressure, { uPressure: tex(), uDivergence: tex(), texelSize: v2() }),
      gradientSubtract: make(SHADERS.gradientSubtract, {
        uPressure: tex(),
        uVelocity: tex(),
        texelSize: v2(),
      }),
      clear: make(SHADERS.clear, { uTexture: tex(), value: num() }),
      display: make(SHADERS.display, {
        uTexture: tex(),
        threshold: num(),
        edgeSoftness: num(),
        inkColor: { value: new THREE.Color() },
      }),
    };
  }

  private allocateTargets(): void {
    const { simResolution: simRes, dyeResolution: dyeRes } = this.config;
    const aspect = this.width / Math.max(1, this.height);
    const opts: THREE.RenderTargetOptions = {
      type: THREE.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    };

    const single = (w: number, h: number) => new THREE.WebGLRenderTarget(w, h, opts);
    const double = (w: number, h: number): DoubleTarget => {
      const target = {
        read: single(w, h),
        write: single(w, h),
        swap(): void {
          const tmp = this.read;
          this.read = this.write;
          this.write = tmp;
        },
      };
      return target;
    };

    this.simSize = { w: simRes, h: Math.max(1, Math.round(simRes / aspect)) };
    this.dyeSize = { w: dyeRes, h: Math.max(1, Math.round(dyeRes / aspect)) };

    this.velocity = double(this.simSize.w, this.simSize.h);
    this.dye = double(this.dyeSize.w, this.dyeSize.h);
    this.divergence = single(this.simSize.w, this.simSize.h);
    this.curlTarget = single(this.simSize.w, this.simSize.h);
    this.pressure = double(this.simSize.w, this.simSize.h);
  }

  private pass(material: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null): void {
    this.quad.material = material;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);
  }

  private setUniforms(
    material: THREE.ShaderMaterial,
    values: Record<string, unknown>,
  ): THREE.ShaderMaterial {
    for (const [key, value] of Object.entries(values)) {
      const uniform = material.uniforms[key];
      if (uniform) uniform.value = value;
    }
    return material;
  }

  private splat(x: number, y: number, vx: number, vy: number): void {
    const { materials, velocity, dye, width, height, config } = this;

    this.setUniforms(materials.splat, {
      aspectRatio: width / Math.max(1, height),
      point: new THREE.Vector2(x / Math.max(1, width), 1 - y / Math.max(1, height)),
      radius: config.splatRadius / 100,
    });

    this.setUniforms(materials.splat, {
      uTarget: velocity.read.texture,
      color: new THREE.Vector3(vx, -vy, 0),
    });
    this.pass(materials.splat, velocity.write);
    velocity.swap();

    this.setUniforms(materials.splat, {
      uTarget: dye.read.texture,
      color: new THREE.Vector3(3, 3, 3),
    });
    this.pass(materials.splat, dye.write);
    dye.swap();
  }

  private simulate(dt: number): void {
    const { materials, velocity, dye, divergence, curlTarget, pressure, simSize, dyeSize, config } =
      this;
    const simTexel = new THREE.Vector2(1 / simSize.w, 1 / simSize.h);

    this.pass(
      this.setUniforms(materials.curl, {
        uVelocity: velocity.read.texture,
        texelSize: simTexel,
      }),
      curlTarget,
    );

    this.pass(
      this.setUniforms(materials.vorticity, {
        uVelocity: velocity.read.texture,
        uCurl: curlTarget.texture,
        texelSize: simTexel,
        curlStrength: config.curl,
        dt,
      }),
      velocity.write,
    );
    velocity.swap();

    this.pass(
      this.setUniforms(materials.divergence, {
        uVelocity: velocity.read.texture,
        texelSize: simTexel,
      }),
      divergence,
    );

    this.pass(
      this.setUniforms(materials.clear, {
        uTexture: pressure.read.texture,
        value: config.pressureDecay,
      }),
      pressure.write,
    );
    pressure.swap();

    this.setUniforms(materials.pressure, {
      uDivergence: divergence.texture,
      texelSize: simTexel,
    });
    for (let i = 0; i < config.pressureIterations; i++) {
      materials.pressure.uniforms['uPressure'].value = pressure.read.texture;
      this.pass(materials.pressure, pressure.write);
      pressure.swap();
    }

    this.pass(
      this.setUniforms(materials.gradientSubtract, {
        uPressure: pressure.read.texture,
        uVelocity: velocity.read.texture,
        texelSize: simTexel,
      }),
      velocity.write,
    );
    velocity.swap();

    this.setUniforms(materials.advection, {
      uVelocity: velocity.read.texture,
      uSource: velocity.read.texture,
      texelSize: simTexel,
      dt,
      dissipation: config.velocityDissipation,
    });
    this.pass(materials.advection, velocity.write);
    velocity.swap();

    this.setUniforms(materials.advection, {
      uSource: dye.read.texture,
      texelSize: new THREE.Vector2(1 / dyeSize.w, 1 / dyeSize.h),
      dissipation: config.dyeDissipation,
    });
    this.pass(materials.advection, dye.write);
    dye.swap();
  }

  private renderToScreen(): void {
    this.pass(
      this.setUniforms(this.materials.display, {
        uTexture: this.dye.read.texture,
        threshold: this.config.threshold,
        edgeSoftness: this.config.edgeSoftness,
        inkColor: this.config.inkColor,
      }),
      null,
    );
  }

  private frame(): void {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.016);
    this.lastTime = now;

    if (this.mouse.moved) {
      this.splat(this.mouse.x, this.mouse.y, this.mouse.vx, this.mouse.vy);
      this.mouse.moved = false;
    }
    this.simulate(dt);
    this.renderToScreen();
  }

  private disposeDouble(double: DoubleTarget): void {
    double.read.dispose();
    double.write.dispose();
  }
}
