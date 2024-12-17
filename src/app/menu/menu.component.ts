import { AfterViewInit, Component } from '@angular/core';
import { gsap, Power4 } from 'gsap';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    gsap.to('.ms_c', {
      height: '100%',
      duration: 0.5,
      ease: Power4.easeOut,
    });
  }
}
