import { ChangeDetectionStrategy, Component } from '@angular/core';

interface QuoteContent {
  readonly headline: readonly string[];
  readonly attribution: string;
  readonly aside: { readonly intro: string; readonly punchline: string };
}

const QUOTE: QuoteContent = {
  headline: ['Do whatever you do with passion!', 'You\u2019ll truly enjoy it.'],
  attribution: 'Yash',
  aside: {
    intro: 'By the way...',
    punchline: 'F**k vibe coding!',
  },
};

@Component({
  selector: 'app-quote',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quote.component.html',
  styleUrl: './quote.component.scss',
})
export class QuoteComponent {
  protected readonly quote = QUOTE;
}
