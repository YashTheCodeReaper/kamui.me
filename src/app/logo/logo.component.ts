import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
})
export class LogoComponent implements AfterViewInit {
  @ViewChild('logoSection') logoSectionEl!: ElementRef;

  ngAfterViewInit(): void {
    this.initFlag();
  }

  initFlag(): void {
    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      const texture = new THREE.TextureLoader().load(
        `assets/images/${
          document.body.classList.contains('theme_default') ? 'oly_1.svg' : 'oly_2.svg'
        }`
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(window.innerWidth * 0.65, window.innerHeight * 0.65);
      this.logoSectionEl.nativeElement.appendChild(renderer.domElement);

      const geometry = new THREE.PlaneGeometry(4, 4, 40, 40);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1,
        blending: THREE.NormalBlending,
      });
      var flag = new THREE.Mesh(geometry, material);
      var clock = new THREE.Clock();

      flag.rotation.set(-0.1, 0.1, 0);

      scene.add(flag);

      camera.position.z = 5;

      function animate() {
        const t = clock.getElapsedTime();

        for (let i = 0; i < flag.geometry.attributes['position'].count; i++) {
          const vertex = new THREE.Vector3().fromBufferAttribute(
            flag.geometry.attributes['position'],
            i
          );

          const wave1 =
            0.25 * Math.sin(vertex.x * 1.4 + t * 10);
          const wave2 = 0.35 * Math.sin(vertex.x * 2.6 + t * 7);
          const wave3 = 0.13 * Math.sin(vertex.y * 0.5 + t * 7);

          flag.geometry.attributes['position'].setXYZ(
            i,
            vertex.x,
            vertex.y,
            wave1 + wave2 + wave3
          );
        }
        flag.geometry.attributes['position'].needsUpdate = true;
        renderer.render(scene, camera);
      }
      renderer.setAnimationLoop(animate);
    } catch (ex) {
      console.error(ex);
    }
  }
}
