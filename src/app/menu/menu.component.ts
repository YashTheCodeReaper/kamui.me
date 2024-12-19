import { AfterViewInit, Component } from '@angular/core';
import { gsap, Power4 } from 'gsap';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [LogoComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    gsap.to('.enc', {
      height: '100%',
      duration: 0.5,
      ease: Power4.easeOut,
    });
  }
}
