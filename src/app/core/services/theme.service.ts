import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type Theme = 'theme_default' | 'theme_light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly _theme = signal<Theme>(this.detectInitialTheme());

  readonly theme = this._theme.asReadonly();

  toggle(): void {
    const next: Theme = this._theme() === 'theme_default' ? 'theme_light' : 'theme_default';
    this.document.body.classList.remove('theme_default', 'theme_light');
    this.document.body.classList.add(next);
    this._theme.set(next);
  }

  private detectInitialTheme(): Theme {
    return this.document.body.classList.contains('theme_default') ? 'theme_default' : 'theme_light';
  }
}
