import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
  inject,
} from '@angular/core';

const REVEAL_THRESHOLD = 0.2;
const HIDDEN_TRANSFORM = 'translateX(50%)';
const HIDDEN_FILTER = 'blur(5px)';
const HIDDEN_OPACITY = '0';
const VISIBLE_TRANSFORM = 'translateX(0)';
const VISIBLE_FILTER = 'blur(0)';
const VISIBLE_OPACITY = '1';
const STAGGER_MS_PER_CHAR = 30;

@Directive({
  selector: '[appTextReveal]',
  standalone: true,
})
export class TextRevealDirective implements AfterViewInit, OnDestroy {
  @Input() revealDelay = 0;
  @Input() revealDuration = 0.4;
  @Input() hideOnOutsideClick = false;

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  private observer?: IntersectionObserver;
  private revealTimer?: ReturnType<typeof setTimeout>;
  private documentClickUnlisten?: () => void;

  ngAfterViewInit(): void {
    this.splitTextIntoChars();
    this.observeViewport();
    if (this.hideOnOutsideClick) this.bindOutsideClickHide();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.revealTimer) clearTimeout(this.revealTimer);
    this.documentClickUnlisten?.();
  }

  private splitTextIntoChars(): void {
    const element = this.hostRef.nativeElement;
    const text = element.textContent ?? '';
    this.renderer.setProperty(element, 'textContent', '');

    const tokens = text.split(/(\s+)/);
    tokens.forEach((token, wordIndex) => {
      if (token.trim() === '') {
        this.renderer.appendChild(element, this.renderer.createText(token));
        return;
      }

      const wordSpan = this.renderer.createElement('span') as HTMLElement;
      this.renderer.addClass(wordSpan, 'word-span');
      this.renderer.setStyle(wordSpan, 'display', 'inline-block');
      this.renderer.setStyle(wordSpan, 'white-space', 'nowrap');

      [...token].forEach((char, charIndex) => {
        const charSpan = this.createHiddenCharSpan(char, wordIndex, charIndex);
        this.renderer.appendChild(wordSpan, charSpan);
      });

      this.renderer.appendChild(element, wordSpan);
    });
  }

  private createHiddenCharSpan(char: string, wordIndex: number, charIndex: number): HTMLElement {
    const span = this.renderer.createElement('span') as HTMLElement;
    const delayMs = (wordIndex + charIndex) * STAGGER_MS_PER_CHAR;
    this.renderer.addClass(span, 'reveal-char');
    this.renderer.setStyle(span, 'display', 'inline-block');
    this.renderer.setStyle(span, 'transform', HIDDEN_TRANSFORM);
    this.renderer.setStyle(span, 'filter', HIDDEN_FILTER);
    this.renderer.setStyle(span, 'opacity', HIDDEN_OPACITY);
    this.renderer.setStyle(span, 'transition', `all ${this.revealDuration}s ease ${delayMs}ms`);
    this.renderer.appendChild(span, this.renderer.createText(char));
    return span;
  }

  private observeViewport(): void {
    const element = this.hostRef.nativeElement;
    this.observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          this.animateIn();
          this.observer?.unobserve(element);
        }
      },
      { threshold: REVEAL_THRESHOLD },
    );
    this.observer.observe(element);
  }

  private bindOutsideClickHide(): void {
    this.documentClickUnlisten = this.renderer.listen('document', 'click', (event: MouseEvent) => {
      if (!this.hostRef.nativeElement.contains(event.target as Node)) this.animateOut();
    });
  }

  private animateIn(): void {
    this.revealTimer = setTimeout(() => {
      this.forEachChar(span => {
        this.renderer.setStyle(span, 'transform', VISIBLE_TRANSFORM);
        this.renderer.setStyle(span, 'filter', VISIBLE_FILTER);
        this.renderer.setStyle(span, 'opacity', VISIBLE_OPACITY);
      });
    }, this.revealDelay * 1000);
  }

  private animateOut(): void {
    this.forEachChar(span => {
      this.renderer.setStyle(span, 'transform', HIDDEN_TRANSFORM);
      this.renderer.setStyle(span, 'filter', HIDDEN_FILTER);
      this.renderer.setStyle(span, 'opacity', HIDDEN_OPACITY);
    });
  }

  private forEachChar(fn: (span: HTMLElement) => void): void {
    this.hostRef.nativeElement
      .querySelectorAll<HTMLElement>('.reveal-char')
      .forEach(fn);
  }
}
