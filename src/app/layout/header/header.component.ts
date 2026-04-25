import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TextRevealDirective } from '../../shared/directives/text-reveal.directive';

const LEFT_INTRO_LINES: readonly string[] = [
  'Just a curious mind',
  'Who loves to code',
  'And finds joy in the results',
];

const RIGHT_INTRO_LINES: readonly string[] = [
  'An explorer in the world of code',
  'Driven by curiosity',
  'And passion towards it',
];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, TextRevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly menuOpen = input(false);
  readonly toggle = output<void>();

  protected readonly leftIntroLines = LEFT_INTRO_LINES;
  protected readonly rightIntroLines = RIGHT_INTRO_LINES;

  protected onToggle(): void {
    this.toggle.emit();
  }
}
