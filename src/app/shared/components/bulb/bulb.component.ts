import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';

import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-bulb',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bulb.component.html',
  styleUrl: './bulb.component.scss',
})
export class BulbComponent {
  @ViewChild('bulbEl', { static: true }) private readonly bulbEl!: ElementRef<HTMLElement>;

  private readonly theme = inject(ThemeService);

  protected readonly isOn = signal(true);

  protected toggle(): void {
    this.restartFlashAnimation();
    this.isOn.update(value => !value);
    this.theme.toggle();
  }

  private restartFlashAnimation(): void {
    for (const animation of this.bulbEl.nativeElement.getAnimations()) {
      animation.cancel();
      animation.play();
    }
  }
}
