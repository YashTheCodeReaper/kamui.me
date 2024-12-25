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
    document.querySelectorAll('.ps_c').forEach((el, i) => {
      gsap.to(`.pfs_toleft${i}`, {
        x: '-10%',
        scrollTrigger: {
          trigger: el,
          scrub: true,
          start: 'top bottom',
          end: 'bottom top'
        },
      });
      gsap.to(`.pfs_toright${i}`, {
        x: '10%',
        scrollTrigger: {
          trigger: el,
          scrub: true,
          start: 'top bottom',
          end: 'bottom top'
        },
      });
    });
  }
}
