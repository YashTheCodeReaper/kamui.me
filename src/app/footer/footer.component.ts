import { AfterViewInit, Component } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(
      '.fs_flex',
      {
        transform: 'scale(1.3) rotate(-18deg) rotateX(90deg) rotateY(9deg)',
      },
      {
        transform: 'scale(1) rotate(0deg) rotateX(0deg) rotateY(0deg)',
        scrollTrigger: {
          trigger: '.fs_flex',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
        },
      }
    );
  }
}
