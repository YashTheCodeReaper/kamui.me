import { AfterViewInit, Component } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent implements AfterViewInit {
  scrollGsapObj: any;

  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);

    this.scrollGsapObj = gsap.fromTo(
      '.gallery_tl_box',
      {
        x: 0,
      },
      {
        x: '-400vw',
        stagger: 2,
        onUpdate: () => {
          if (!this.scrollGsapObj?.ratio) return;

          gsap.fromTo(
            '.flex_content1',
            {
              x: 0,
            },
            {
              x: this.scrollGsapObj.ratio * -1000,
              duration: 0,
            }
          );

          gsap.fromTo(
            '.flex_content2',
            {
              x: 0,
            },
            {
              x: this.scrollGsapObj.ratio * -4000,
              duration: 0,
            }
          );
        },
        scrollTrigger: {
          pin: '.gallery_tl_box',
          trigger: '.gallery_section',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      }
    );
  }
}
