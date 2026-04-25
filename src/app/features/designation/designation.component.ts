import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ModelScene, createSilhouetteDecorator } from '../../shared/three/model-scene';
import { TextRevealDirective } from '../../shared/directives/text-reveal.directive';

const SECTION_SELECTOR = '.designation_section';
const HEADLINE_SPAN_SELECTOR = '.designation_section h1 span';
const SAMURAI_MODEL_PATH = 'assets/models/standingsamurai.glb';
const SILHOUETTE_COLOUR = 0x2d2d2d;

@Component({
  selector: 'app-designation',
  standalone: true,
  imports: [TextRevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './designation.component.html',
  styleUrl: './designation.component.scss',
})
export class DesignationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sceneHost', { static: true }) private readonly sceneHost!: ElementRef<HTMLElement>;

  private scene?: ModelScene;
  private headlineTween?: gsap.core.Tween;

  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);
    this.initSamuraiScene();
    this.initHeadlineParallax();
  }

  ngOnDestroy(): void {
    this.headlineTween?.scrollTrigger?.kill();
    this.headlineTween?.kill();
    this.scene?.dispose();
  }

  @HostListener('window:mousemove', ['$event'])
  protected onPointerMove(event: MouseEvent): void {
    this.scene?.setPointer(event.clientX, event.clientY);
  }

  private initSamuraiScene(): void {
    this.scene = new ModelScene(this.sceneHost.nativeElement, {
      decorateMesh: createSilhouetteDecorator(SILHOUETTE_COLOUR),
      enableShadows: false,
      enablePitch: false,
      pointerSensitivity: 0.75,
      cameraDistanceMultiplier: 1.25,
      frameModel: (model, { center }) => {
        // Recenter horizontally and lift the model so it reads as standing.
        model.position.set(-center.x, -center.y * 1.2, 0);
      },
    });

    this.scene
      .load(SAMURAI_MODEL_PATH)
      .catch(err => console.error('[DesignationComponent] samurai load failed', err));
    this.scene.start();
  }

  private initHeadlineParallax(): void {
    this.headlineTween = gsap.fromTo(
      HEADLINE_SPAN_SELECTOR,
      { y: '100%', opacity: 0 },
      {
        y: '-50%',
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
        stagger: 0.0075,
        scrollTrigger: {
          trigger: SECTION_SELECTOR,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
  }
}
