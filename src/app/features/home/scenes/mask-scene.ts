import {
  AmbientLight,
  Box3,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface MaskSceneOptions {
  readonly cameraDistanceMultiplier: number;
  readonly pointerSensitivity: number;
  readonly rotationSmoothing: number;
  readonly pitchLimit: number;
  readonly yawLimit: number;
}

const DEFAULT_OPTIONS: MaskSceneOptions = {
  cameraDistanceMultiplier: 1.25,
  pointerSensitivity: 0.5,
  rotationSmoothing: 0.05,
  pitchLimit: 0.5,
  yawLimit: 0.8,
};

export class MaskScene {
  private readonly scene = new Scene();
  private readonly camera: PerspectiveCamera;
  private readonly renderer: WebGLRenderer;
  private readonly options: MaskSceneOptions;
  private readonly pointer = { x: 0, y: 0 };

  private model: Group | null = null;
  private animationHandle: number | null = null;
  private disposed = false;

  constructor(
    private readonly host: HTMLElement,
    options: Partial<MaskSceneOptions> = {},
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    this.camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    this.renderer = new WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    this.host.appendChild(this.renderer.domElement);
    this.addLights();
  }

  async load(modelPath: string): Promise<void> {
    const gltf = await new GLTFLoader().loadAsync(modelPath);
    this.model = gltf.scene;

    this.model.traverse(node => {
      const mesh = node as Mesh;
      if (mesh.isMesh && mesh.material) {
        const material = mesh.material as MeshStandardMaterial;
        material.metalness = 1;
        material.roughness = 0.1;
      }
    });

    const box = new Box3().setFromObject(this.model);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());

    this.model.position.set(center.x, -center.y, -center.z * 1.2);

    const distance =
      Math.max(size.x, size.y, size.z) * this.options.cameraDistanceMultiplier;
    this.camera.position.set(0, 0, distance);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(this.model);
  }

  setPointer(clientX: number, clientY: number): void {
    this.pointer.x = (clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  }

  start(): void {
    const tick = () => {
      if (this.disposed) return;
      this.animationHandle = requestAnimationFrame(tick);
      this.updateRotation();
      this.renderer.render(this.scene, this.camera);
    };
    tick();
  }

  dispose(): void {
    this.disposed = true;
    if (this.animationHandle !== null) {
      cancelAnimationFrame(this.animationHandle);
    }
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private addLights(): void {
    this.scene.add(new AmbientLight(0xffffff, 0.7));

    const key = new DirectionalLight(0xcc4b3f, 700);
    key.position.set(1, 2, 3);
    key.castShadow = true;
    key.shadow.bias = -0.001;
    key.shadow.mapSize.set(1024, 1024);
    this.scene.add(key);

    const fill = new DirectionalLight(0xffffff, 1);
    fill.position.set(0, 0, 0);
    this.scene.add(fill);
  }

  private updateRotation(): void {
    if (!this.model) return;

    const { pointerSensitivity, rotationSmoothing, pitchLimit, yawLimit } = this.options;
    const targetYaw = this.pointer.x * pointerSensitivity;
    const targetPitch = -this.pointer.y * pointerSensitivity;

    this.model.rotation.y += (targetYaw - this.model.rotation.y) * rotationSmoothing;
    this.model.rotation.x += (targetPitch - this.model.rotation.x) * rotationSmoothing;
    this.model.rotation.x = MathUtils.clamp(this.model.rotation.x, -pitchLimit, pitchLimit);
    this.model.rotation.y = MathUtils.clamp(this.model.rotation.y, -yawLimit, yawLimit);
  }
}
