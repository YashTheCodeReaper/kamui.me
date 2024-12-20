import { AfterViewInit, Component } from '@angular/core';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
declare var window: any;

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent implements AfterViewInit {
  images: any = [];
  loadedImageCount = 0;
  currentScroll = 0;
  resizeTimeout: any;

  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);
    let tl = gsap.timeline({
      scrollTrigger: {
        pin: true,
        trigger: '.portfolio_section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });

    setTimeout(() => {
      this.loadImages();
    }, 500);
  }

  loadImages(): void {
    try {
      for (let i = 0; i <= 6; i++) {
        const img = new Image();
        img.onload = () => {
          this.images.push(img);
          this.loadedImageCount++;
          if (this.loadedImageCount === 6) this.initScene();
        };

        img.onerror = () => {
          this.loadedImageCount++;
          if (this.loadedImageCount === 6) this.initScene();
        };

        img.src = `assets/images/pfl_${i}.png`;
      }
    } catch (ex) {
      console.error(ex);
    }
  }

  initScene(): void {
    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#portfolioCanvas') as HTMLCanvasElement,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000);

      const parentWidth = 20;
      const parentHeight = 75;
      const curvature = 35;
      const segmentsX = 200;
      const segmentsY = 200;

      const parentGeometry = new THREE.PlaneGeometry(
        parentWidth,
        parentHeight,
        segmentsX,
        segmentsY
      );

      const positions = parentGeometry.attributes['position'].array;
      for (let i = 0; i < positions.length; i += 3) {
        const y = positions[i + 1];
        const distanceFromCenter = Math.abs(y / (parentHeight / 2));
        positions[i + 2] = Math.pow(distanceFromCenter, 2) * curvature;
      }
      parentGeometry.computeVertexNormals();

      const totalSides = 7;
      const slideHeight = 15;
      const gap = 0.5;
      const cycleHeight = totalSides * (slideHeight + gap);

      const textureCanvas = document.createElement('canvas');
      const ctx = textureCanvas.getContext('2d', {
        alpha: false,
        willReadFrequently: false,
      });
      textureCanvas.width = 2048;
      textureCanvas.height = 8192;

      const texture = new THREE.CanvasTexture(textureCanvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = Math.min(
        4,
        renderer.capabilities.getMaxAnisotropy()
      );
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const parentMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        opacity: 1,
        blending: THREE.NormalBlending,
      });

      const parentMesh = new THREE.Mesh(parentGeometry, parentMaterial);
      parentMesh.position.set(0, 0, 0);
      parentMesh.rotation.x = THREE.MathUtils.degToRad(-20);
      parentMesh.rotation.y = THREE.MathUtils.degToRad(20);
      scene.add(parentMesh);

      const distance = 17.5;
      const heightOffset = 5;
      const offsetX = distance * Math.sin(THREE.MathUtils.degToRad(20));
      const offsetZ = distance * Math.cos(THREE.MathUtils.degToRad(20));

      camera.position.set(offsetX, heightOffset, offsetZ);
      camera.lookAt(0, -2, 0);
      camera.rotation.z = THREE.MathUtils.degToRad(-5);

      const slideTitles = ['1', '2', '3', '4', '5', '6', '7'];

      const updateTexture = (offset = 0) => {
        if (!ctx) return;
        ctx.fillStyle = '000';
        ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

        const fontSize = 100;
        ctx.font = `500 ${fontSize}px "Neue Hass Grotesk"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const extraSlides = 2;

        for (let i = -extraSlides; i < totalSides + extraSlides; i++) {
          let slideY = -i * (slideHeight + gap);
          slideY += offset * cycleHeight;

          const textureY = (slideY / cycleHeight) * textureCanvas.height;
          let wrappedY = textureY % textureCanvas.height;
          if (wrappedY < 0) wrappedY += textureCanvas.height;

          let slideIndex = ((-i % totalSides) + totalSides) % totalSides;
          let slideNumber = slideIndex + 1;

          const slideRect = {
            x: textureCanvas.width * 0.05,
            y: wrappedY,
            width: textureCanvas.width * 0.9,
            height: (slideHeight / cycleHeight) * textureCanvas.height,
          };

          const img = this.images[slideNumber - 1];

          if (img) {
            const imgAspect = img.width / img.height;
            const rectAspect = slideRect.width / slideRect.height;
            let drawWidth, drawHeight, drawX, drawY;

            if (imgAspect > rectAspect) {
              drawHeight = slideRect.height;
              drawWidth = drawHeight * imgAspect;
              drawX = slideRect.x + (slideRect.width - drawWidth) / 2;
              drawY = slideRect.y;
            } else {
              drawWidth = slideRect.width;
              drawHeight = drawWidth / imgAspect;
              drawX = slideRect.x;
              drawY = slideRect.y + (slideRect.height - drawHeight) / 2;
            }

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(
              slideRect.x,
              slideRect.y,
              slideRect.width,
              slideRect.height
            );
            ctx.clip();

            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            ctx.restore();
            ctx.fillStyle = '000';
            // ctx.fillText(
            //   slideTitles[slideIndex],
            //   textureCanvas.width / 2,
            //   wrappedY + slideRect.height / 2
            // );
          }
        }
        texture.needsUpdate = true;
      };

      window.lenis.on(
        'scroll',
        ({ scroll, limit, velocity, direction, progress }: any) => {
          this.currentScroll = scroll / limit;
          updateTexture(-this.currentScroll);
          renderer.render(scene, camera);
        }
      );

      window.addEventListener(
        'resize',
        () => {
          if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
          this.resizeTimeout = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
          });
        },
        250
      );

      updateTexture(0);
      renderer.render(scene, camera);
    } catch (ex) {
      console.error(ex);
    }
  }
}
