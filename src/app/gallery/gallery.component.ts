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

    gsap.fromTo(
      '.point_arrow_box',
      {
        marginLeft: '100rem',
      },
      {
        marginLeft: '70rem',
        stagger: 2,
        scrollTrigger: {
          trigger: '.point_arrow_box',
          start: 'left right',
          end: 'left center',
          scrub: true,
        },
      },
    );
    gsap.fromTo(
      '.point_arrow',
      {
        width: '0',
        height: '0',
      },
      {
        width: '1rem',
        height: '1rem',
        stagger: 2,
        scrollTrigger: {
          trigger: '.point_arrow_box',
          // start: 'left center',
          // end: 'right center',
          // scrub: true,
          markers: false,
        },
      },
    );

    ScrollTrigger.create({
      trigger: '.point_arrow_box',
      start: 'left center', // when the left edge of .box hits the center of the viewport
      end: 'right center', // when the right edge of .box hits the center of the viewport
      onEnter: () => console.log('Box entered viewport'),
      onLeave: () => console.log('Box left viewport to the right'),
      onEnterBack: () => console.log('Box entered viewport from the right'),
      onLeaveBack: () => console.log('Box left viewport to the left'),
      markers: false, // for debugging
      horizontal: true,
    });

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
            },
          );

          gsap.fromTo(
            '.flex_content2',
            {
              x: 0,
            },
            {
              x: this.scrollGsapObj.ratio * -4000,
              duration: 0,
            },
          );
        },
        scrollTrigger: {
          pin: '.gallery_tl_box',
          trigger: '.gallery_section',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      },
    );
  }
}
