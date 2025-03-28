import { AfterViewInit, Component } from '@angular/core';
import { LogoComponent } from '../logo/logo.component';
import { gsap, Power3 } from 'gsap';
import { BulbComponent } from '../bulb/bulb.component';

declare var Gradient: any;
declare var document: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LogoComponent, BulbComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements AfterViewInit {
  sliderIndex: number = 0;
  featureTitle: string = 'Featured blog';
  featureContentH11: string = 'Journey Of';
  featureContentH12: string = 'The Tarnished';
  gradient: any;

  ngAfterViewInit(): void {
    this.gradient = new Gradient();
    this.gradient.initGradient('#home-gradient-canvas')
    this.modifySlider();
    setInterval(() => this.modifySlider(), 12000);
  }

  modifySlider(): void {
    try {
      if (this.sliderIndex == 4)
        document
          .querySelector(`.si${this.sliderIndex}`)
          ?.classList?.remove('active');
      this.sliderIndex <= 3 ? (this.sliderIndex += 1) : (this.sliderIndex = 1);
      document
        .querySelector(`.si${this.sliderIndex - 1}`)
        ?.classList?.remove('active');
      document.querySelector(`.si${this.sliderIndex}`)?.classList.add('active');
      if (this.sliderIndex == 1) {
        this.featureTitle = 'Featured blog';
        this.featureContentH11 = 'Journey Of';
        this.featureContentH12 = 'The Tarnished';
      } else if (this.sliderIndex == 2) {
        this.featureTitle = 'Featured skills';
        this.featureContentH11 = 'Know What';
        this.featureContentH12 = 'I Know';
      } else if (this.sliderIndex == 4) {
        this.featureTitle = 'Catch up';
        this.featureContentH11 = 'Get my';
        this.featureContentH12 = 'Resume';
      } else if (this.sliderIndex == 3) {
        this.featureTitle = 'Featured portfolio';
        this.featureContentH11 = 'See What';
        this.featureContentH12 = 'I Did';
      }
      gsap.to('.fcf-h5', {
        transform: 'translateX(0%)',
        delay: 1.5,
        ease: Power3.easeOut,
        duration: 1.5,
      });
      gsap.to('.fcf-h11', {
        transform: 'translateX(0%)',
        delay: 0.5,
        ease: Power3.easeOut,
        duration: 1.5,
      });
      gsap.to('.fcf-h12', {
        transform: 'translateX(0%)',
        delay: 0.75,
        ease: Power3.easeOut,
        duration: 1.5,
      });

      setTimeout(() => {
        gsap.to('.fcf-h5', {
          transform: 'translateX(-50rem)',
          delay: 0,
          ease: Power3.easeInOut,
          duration: 1.5,
        });
        gsap.to('.fcf-h11', {
          transform: 'translateX(-50rem)',
          delay: 0.5,
          ease: Power3.easeInOut,
          duration: 1.5,
        });
        gsap.to('.fcf-h12', {
          transform: 'translateX(-50rem)',
          delay: 0.75,
          ease: Power3.easeInOut,
          duration: 1.5,
        });
      }, 10000);
    } catch (ex) {
      console.error(ex);
    }
  }

  onToggleVideo(reveal: boolean): void {
    try {
      document.querySelectorAll('.vc_bg').forEach((el: any) => {
        if(!reveal) el.style.height = '100%'
        else el.style.height = '0%'
      })
      document.getElementById('body')?.classList.toggle('theme_default');
      document.querySelector('#home-gradient-canvas').style.opacity = reveal ? 0 : 1;
    } catch (ex) {
      console.error(ex)
    }
  }
}
