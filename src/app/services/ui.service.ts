import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  constructor() { }

  public toggleTheme(): void {
    try {
      document.body.classList.toggle('theme_default')
      document.body.classList.toggle('theme_light')
    } catch (ex) {
      console.error(ex)
    }
  }
}
