import { AfterViewInit, Component } from '@angular/core';
import { gsap, Power0 } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements AfterViewInit {
  scrollGsapObj: any;

  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);
    this.scrollGsapObj = gsap.fromTo(
      '.as_slider_overlay',
      {
        x: 0,
      },
      {
        x: '-100vw',
        stagger: 2,
        onUpdate: () => {
          if (!this.scrollGsapObj?.ratio) return;

          // Section 1
          gsap.fromTo(
            '.as_slider_overlay .c1 h3',
            {
              x: 0,
            },
            {
              x: this.scrollGsapObj.ratio * 100,
              duration: 0,
            }
          );
          gsap.fromTo(
            '.as_slider_overlay .c1 img',
            {
              x: 0,
            },
            {
              x: this.scrollGsapObj.ratio * -250,
              duration: 0,
            }
          );
          gsap.fromTo(
            '.as_slider_overlay .c1 p',
            {
              x: 0,
            },
            {
              x: this.scrollGsapObj.ratio * -550,
              duration: 0,
            }
          );

          // Section 2
          gsap.fromTo(
            '.as_slider_overlay .c2 h3',
            {
              x: 0,
            },
            {
              x: this.scrollGsapObj.ratio * -50,
              duration: 0,
            }
          );
          gsap.fromTo(
            '.as_slider_overlay .c2 .img_container',
            { x: 0, backgroundPosition: '60% 50%' },
            {
              x: this.scrollGsapObj.ratio * -200,
              backgroundPosition: `${this.scrollGsapObj.ratio * -40 + 60}% ${
                this.scrollGsapObj.ratio * -40 + 50
              }%`,
              duration: 0,
            }
          );
        },
        scrollTrigger: {
          trigger: '.about_section',
          pin: '.as_slider_overlay',
          start: 'top top',
          scrub: true,
          end: 'bottom bottom',
        },
      }
    );
  }
}
