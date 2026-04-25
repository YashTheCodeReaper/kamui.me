import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  /** Visible label inside the button. */
  readonly text = input<string>('NEXT');

  /** Foreground colour applied to the label text. */
  readonly textColor = input<string>('var(--main-1)');

  /** Foreground colour applied to the chevron arrows. */
  readonly arrowColor = input<string>('#fff');

  /** Native button `type` attribute. */
  readonly type = input<ButtonType>('button');

  /** Disabled state. */
  readonly disabled = input<boolean>(false);

  /** Emitted whenever the button is activated. */
  readonly clicked = output<MouseEvent>();

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) return;
    this.clicked.emit(event);
  }
}
