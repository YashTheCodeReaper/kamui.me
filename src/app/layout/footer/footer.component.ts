import { AfterViewInit, Component } from '@angular/core';
import { TextRevealDirective } from '../../shared/directives/text-reveal.directive';
import { ButtonComponent } from '../../shared/components/button/button.component';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TextRevealDirective, ButtonComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      '.kamui_foot h1',
      { y: 1000, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: '.footer',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
        },
      },
    );

    gsap.fromTo(
      '.footer_extra',
      { y: -500, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: '.footer',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
        },
      },
    );

    gsap.fromTo(
      '.footer_top',
      { y: -500, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: '.footer',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
        },
      },
    );

    gsap.fromTo(
      '.footer img',
      { marginTop: -300, opacity: 0 },
      {
        marginTop: 0,
        opacity: 0.25,
        scrollTrigger: {
          trigger: '.footer',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
        },
      },
    );
  }
}
