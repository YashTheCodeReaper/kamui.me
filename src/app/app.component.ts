import { Component } from '@angular/core';
import { HomeComponent } from "./home/home.component";
import { SplashComponent } from "./splash/splash.component";
import { LogoComponent } from './logo/logo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomeComponent, SplashComponent, LogoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'kamui.me';
}
