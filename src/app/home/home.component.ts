import { Component, OnInit } from '@angular/core';
import { LogoComponent } from '../logo/logo.component';
import VanillaTilt from 'vanilla-tilt';
import gsap from 'gsap';

declare var document: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LogoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  vanillaTiltIns!: VanillaTilt;

  ngOnInit(): void {
    const element = document.querySelector('.hs_tilter');
    this.vanillaTiltIns = new VanillaTilt(element, {
      max: 12,
      speed: 300,
      scale: 1,
      axis: 'x',
      glare: false,
      'full-page-listening': true,
    });
    element.addEventListener('tiltChange', (event: any) => {
      gsap.to('.hs1', {
        width: `${50 + event.detail.tiltX}%`,
      });
      gsap.to('.hs2', {
        width: `${50 - event.detail.tiltX}%`,
      });
    });
  }
}
