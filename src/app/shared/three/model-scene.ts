import {
  AmbientLight,
  Box3,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * A reusable, configurable wrapper around a Three.js scene that loads a
 * single GLTF/GLB model, frames it to the camera, and rotates it toward the
 * pointer. Used by HomeComponent (mask) and DesignationComponent (samurai).
 */

export type SceneSetup = (scene: Scene) => void;
export type MeshDecorator = (mesh: Mesh) => void;
export type ModelFraming = (
  model: Group,
  bounds: { center: Vector3; size: Vector3; box: Box3 },
) => void;

export interface ModelSceneOptions {
  readonly cameraDistanceMultiplier: number;
  readonly pointerSensitivity: number;
  readonly rotationSmoothing: number;
  readonly pitchLimit: number;
  readonly yawLimit: number;
  readonly enablePitch: boolean;
  readonly enableShadows: boolean;
  readonly lights?: SceneSetup;
  readonly decorateMesh?: MeshDecorator;
  readonly frameModel?: ModelFraming;
}

const DEFAULT_OPTIONS: ModelSceneOptions = {
  cameraDistanceMultiplier: 1.25,
  pointerSensitivity: 0.5,
  rotationSmoothing: 0.05,
  pitchLimit: 0.5,
  yawLimit: 0.8,
  enablePitch: true,
  enableShadows: true,
};

export class ModelScene {
  private readonly scene = new Scene();
  private readonly camera: PerspectiveCamera;
  private readonly renderer: WebGLRenderer;
  private readonly options: ModelSceneOptions;
  private readonly pointer = { x: 0, y: 0 };

  private model: Group | null = null;
  private animationHandle: number | null = null;
  private resizeListener?: () => void;
  private disposed = false;
  private visible = true;
  private intersectionObserver?: IntersectionObserver;

  constructor(private readonly host: HTMLElement, options: Partial<ModelSceneOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    this.camera = new PerspectiveCamera(60, this.aspect, 0.1, 1000);

    this.renderer = new WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (this.options.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = PCFSoftShadowMap;
    }

    this.host.appendChild(this.renderer.domElement);
    this.options.lights?.(this.scene);
  }

  async load(modelPath: string): Promise<void> {
    const gltf = await new GLTFLoader().loadAsync(modelPath);
    if (this.disposed) return;

    this.model = gltf.scene;

    if (this.options.decorateMesh) {
      this.model.traverse(node => {
        const mesh = node as Mesh;
        if (mesh.isMesh) this.options.decorateMesh!(mesh);
      });
    }

    this.frameModel();
    this.scene.add(this.model);
  }

  setPointer(clientX: number, clientY: number): void {
    this.pointer.x = (clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  }

  start(): void {
    // Only render while the host element is on screen — the scene is fixed
    // to a section and there's no point burning GPU + main-thread budget on
    // it once the user has scrolled past.
    this.intersectionObserver = new IntersectionObserver(
      entries => {
        for (const entry of entries) this.visible = entry.isIntersecting;
      },
      { rootMargin: '20% 0px' },
    );
    this.intersectionObserver.observe(this.host);

    const tick = (): void => {
      if (this.disposed) return;
      this.animationHandle = requestAnimationFrame(tick);
      if (!this.visible) return;
      this.updateRotation();
      this.renderer.render(this.scene, this.camera);
    };
    tick();
  }

  attachResize(): void {
    this.resizeListener = () => {
      this.camera.aspect = this.aspect;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', this.resizeListener);
  }

  dispose(): void {
    this.disposed = true;
    if (this.animationHandle !== null) cancelAnimationFrame(this.animationHandle);
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      this.resizeListener = undefined;
    }
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = undefined;
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private get aspect(): number {
    return window.innerWidth / window.innerHeight;
  }

  private frameModel(): void {
    if (!this.model) return;

    const box = new Box3().setFromObject(this.model);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());

    if (this.options.frameModel) {
      this.options.frameModel(this.model, { center, size, box });
    } else {
      this.model.position.set(-center.x, -center.y, -center.z);
    }

    const distance =
      Math.max(size.x, size.y, size.z) * this.options.cameraDistanceMultiplier;
    this.camera.position.set(0, 0, distance);
    this.camera.lookAt(0, 0, 0);
  }

  private updateRotation(): void {
    if (!this.model) return;
    const { pointerSensitivity, rotationSmoothing, pitchLimit, yawLimit, enablePitch } =
      this.options;

    const targetYaw = this.pointer.x * pointerSensitivity;
    this.model.rotation.y += (targetYaw - this.model.rotation.y) * rotationSmoothing;
    this.model.rotation.y = MathUtils.clamp(this.model.rotation.y, -yawLimit, yawLimit);

    if (enablePitch) {
      const targetPitch = -this.pointer.y * pointerSensitivity;
      this.model.rotation.x += (targetPitch - this.model.rotation.x) * rotationSmoothing;
      this.model.rotation.x = MathUtils.clamp(this.model.rotation.x, -pitchLimit, pitchLimit);
    }
  }
}

// ----- Reusable lighting/material presets -------------------------------------

export const pbrRedKeyLighting: SceneSetup = scene => {
  scene.add(new AmbientLight(0xffffff, 0.7));

  const key = new DirectionalLight(0xcc4b3f, 700);
  key.position.set(1, 2, 3);
  key.castShadow = true;
  key.shadow.bias = -0.001;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  const fill = new DirectionalLight(0xffffff, 1);
  fill.position.set(0, 0, 0);
  scene.add(fill);
};

export const decoratePbrMetal: MeshDecorator = mesh => {
  const material = mesh.material as MeshStandardMaterial | undefined;
  if (!material) return;
  material.metalness = 1;
  material.roughness = 0.1;
};

export const createSilhouetteDecorator = (color: number = 0x2d2d2d): MeshDecorator => mesh => {
  mesh.material = new MeshBasicMaterial({ color });
};
