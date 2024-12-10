import { Component } from '@angular/core';
import { SplashComponent } from "./splash/splash.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SplashComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'kamui.me';
}
