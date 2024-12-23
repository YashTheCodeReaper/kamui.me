import { AfterViewInit, Component } from '@angular/core';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollerComponent } from "./scroller/scroller.component";
declare var window: any;

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [ScrollerComponent],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent implements AfterViewInit {
  images: any = [];
  loadedImageCount = 0;
  currentScroll = 0;
  resizeTimeout: any;

  ngAfterViewInit(): void {
  }
}
