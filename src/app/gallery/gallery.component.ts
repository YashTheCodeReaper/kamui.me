import { AfterViewInit, Component } from '@angular/core';
import { gsap, Power0 } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline();
    tl.fromTo(
      '.gss1',
      {
        transform:
          'translate(-25%, 110%) translate3d(0px, 0px, 0px) rotate(15deg)',
      },
      {
        transform: 'translate(0%, 0%) translate3d(0px, 0px, 0px) rotate(0deg)',
        scrollTrigger: {
          trigger: '.gallery_section',
          start: 'top bottom',
          end: 'top 50%',
          scrub: true,
        },
      }
    )
      .fromTo(
        '.gss1',
        {
          transform:
            'translate(0%, 0%) translate3d(0px, 0px, 0px) rotate(0deg)',
        },
        {
          transform:
            'translate(-25%, -80%) translate3d(0px, 0px, 0px) rotate(-7deg)',
          ease: Power0.easeInOut,
          scrollTrigger: {
            trigger: '.gss1',
            start: 'top 35%',
            end: 'bottom top',
            scrub: true,
          },
        }
      )
      .fromTo(
        '.gss2',
        {
          transform:
            'translate(15%, 110%) translate3d(0px, 0px, 0px) rotate(15deg)',
        },
        {
          transform:
            'translate(0%, 0%) translate3d(0px, 0px, 0px) rotate(0deg)',
          scrollTrigger: {
            trigger: '.gss1',
            start: 'top 40%',
            end: 'top 5%',
            scrub: true,
          },
        }
      )
      .fromTo(
        '.gss2',
        {
          transform:
            'translate(0%, 0%) translate3d(0px, 0px, 0px) rotate(0deg)',
        },
        {
          transform:
            'translate(-25%, -80%) translate3d(0px, 0px, 0px) rotate(-7deg)',
          ease: Power0.easeInOut,
          scrollTrigger: {
            trigger: '.gss2',
            start: 'top top',
            end: 'bottom 50%',
            scrub: true,
          },
        }
      );

    ScrollTrigger.refresh();
  }
}
