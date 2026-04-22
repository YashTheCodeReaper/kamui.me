import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { gsap, Power3 } from 'gsap';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

declare var Gradient: any;
declare var document: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('homeSection') homeSection!: ElementRef;
  sliderIndex: number = 0;
  featureTitle: string = 'Featured blog';
  featureContentH11: string = 'Journey Of';
  featureContentH12: string = 'The Tarnished';
  gradient: any;
  model: any;
  modelSize: any;
  mouse: { x: number; y: number } = { x: 0, y: 0 };
  sensitivity = 0.5;
  enableHover: boolean = true;

  ngAfterViewInit(): void {
    this.gradient = new Gradient();
    this.gradient.initGradient('#home-gradient-canvas');
    this.modifySlider();
    setInterval(() => this.modifySlider(), 12000);
    this.setupSamuMask(false, 'assets/models/samumask.glb');
  }

  modifySlider(): void {
    try {
      if (this.sliderIndex == 4)
        document
          .querySelector(`.si${this.sliderIndex}`)
          ?.classList?.remove('active');
      this.sliderIndex <= 3 ? (this.sliderIndex += 1) : (this.sliderIndex = 1);
      document
        .querySelector(`.si${this.sliderIndex - 1}`)
        ?.classList?.remove('active');
      document.querySelector(`.si${this.sliderIndex}`)?.classList.add('active');
      if (this.sliderIndex == 1) {
        this.featureTitle = 'Featured blog';
        this.featureContentH11 = 'Journey Of';
        this.featureContentH12 = 'The Tarnished';
      } else if (this.sliderIndex == 2) {
        this.featureTitle = 'Featured skills';
        this.featureContentH11 = 'Know What';
        this.featureContentH12 = 'I Know';
      } else if (this.sliderIndex == 4) {
        this.featureTitle = 'Catch up';
        this.featureContentH11 = 'Get my';
        this.featureContentH12 = 'Resume';
      } else if (this.sliderIndex == 3) {
        this.featureTitle = 'Featured portfolio';
        this.featureContentH11 = 'See What';
        this.featureContentH12 = 'I Did';
      }
      gsap.to('.fcf-h5', {
        transform: 'translateX(0%)',
        delay: 1.5,
        ease: Power3.easeOut,
        duration: 1.5,
      });
      gsap.to('.fcf-h11', {
        transform: 'translateX(0%)',
        delay: 0.5,
        ease: Power3.easeOut,
        duration: 1.5,
      });
      gsap.to('.fcf-h12', {
        transform: 'translateX(0%)',
        delay: 0.75,
        ease: Power3.easeOut,
        duration: 1.5,
      });

      setTimeout(() => {
        gsap.to('.fcf-h5', {
          transform: 'translateX(-50rem)',
          delay: 0,
          ease: Power3.easeInOut,
          duration: 1.5,
        });
        gsap.to('.fcf-h11', {
          transform: 'translateX(-50rem)',
          delay: 0.5,
          ease: Power3.easeInOut,
          duration: 1.5,
        });
        gsap.to('.fcf-h12', {
          transform: 'translateX(-50rem)',
          delay: 0.75,
          ease: Power3.easeInOut,
          duration: 1.5,
        });
      }, 10000);
    } catch (ex) {
      console.error(ex);
    }
  }

  onToggleVideo(reveal: boolean): void {
    try {
      document.querySelectorAll('.vc_bg').forEach((el: any) => {
        if (!reveal) el.style.height = '100%';
        else el.style.height = '0%';
      });
      document.getElementById('body')?.classList.toggle('theme_default');
      document.querySelector('#home-gradient-canvas').style.opacity = reveal
        ? 0
        : 1;
    } catch (ex) {
      console.error(ex);
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  setupSamuMask(isSilhouette: boolean, modelPath: string) {
    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });

      renderer.setClearColor(0x000000, 0);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      if (!isSilhouette) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      }

      this.homeSection.nativeElement.appendChild(renderer.domElement);

      // Only add lights in normal mode
      if (!isSilhouette) {
        scene.add(new THREE.AmbientLight(0xffffff, 0.7));

        const mainLight = new THREE.DirectionalLight(0xcc4b3f, 700);
        mainLight.position.set(1, 2, 3);
        mainLight.castShadow = true;
        mainLight.shadow.bias = -0.001;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 1);
        fillLight.position.set(0, 0, 0);
        scene.add(fillLight);
      }

      const setupModel = () => {
        if (!this.model || !this.modelSize) return;

        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());

        this.model.position.set(center.x, -center.y, -center.z * 1.2);

        const cameraDistance = 1.25;
        camera.position.set(
          0,
          0,
          Math.max(this.modelSize.x, this.modelSize.y, this.modelSize.z) *
            cameraDistance,
        );
        camera.lookAt(0, 0, 0);
      };

      new GLTFLoader().load(modelPath, (gltf) => {
        this.model = gltf.scene;

        this.model.traverse((node: any) => {
          if (node.isMesh) {
            if (isSilhouette) {
              // Flat, unlit, low-overhead material
              node.material = new THREE.MeshBasicMaterial({ color: 0x2d2d2d });
            } else {
              // Rich PBR material
              if (node.material) {
                Object.assign(node.material, {
                  metalness: 1,
                  roughness: 0.1,
                });
              }
            }
          }
        });

        const box = new THREE.Box3().setFromObject(this.model);
        const size = box.getSize(new THREE.Vector3());
        this.modelSize = size;

        scene.add(this.model);
        setupModel();
      });

      const animate = () => {
        requestAnimationFrame(animate);

        if (this.model) {
          const targetX = this.mouse.x * this.sensitivity;
          const targetY = -this.mouse.y * this.sensitivity;

          this.model.rotation.y += (targetX - this.model.rotation.y) * 0.05;
          this.model.rotation.x += (targetY - this.model.rotation.x) * 0.05;

          this.model.rotation.x = THREE.MathUtils.clamp(
            this.model.rotation.x,
            -0.5,
            0.5,
          );
          this.model.rotation.y = THREE.MathUtils.clamp(
            this.model.rotation.y,
            -0.8,
            0.8,
          );
        }

        renderer.render(scene, camera);
      };

      animate();

      // Optional: add back responsive resizing
      // window.addEventListener('resize', () => {
      //   camera.aspect = window.innerWidth / window.innerHeight;
      //   camera.updateProjectionMatrix();
      //   renderer.setSize(window.innerWidth, window.innerHeight);
      // });
    } catch (error) {
      console.error(error);
    }
  }
}
