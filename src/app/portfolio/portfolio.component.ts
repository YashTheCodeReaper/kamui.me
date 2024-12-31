import { AfterViewInit, Component } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [LottieComponent],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent implements AfterViewInit {
  options: AnimationOptions = {
    path: '/assets/pfl_bg.json',
  };

  ngAfterViewInit(): void {}
}
