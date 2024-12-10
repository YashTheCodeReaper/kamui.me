import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener } from '@angular/core';

declare var document: any;

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash.component.html',
  styleUrl: './splash.component.scss',
})
export class SplashComponent implements AfterViewInit {
  klBoxes: any[] = [
    [0, 1, 2, 3, 4, 5],
    [0, 1, 2, 3, 4, 5],
    [0, 1, 2, 3, 4, 5],
    [0, 1, 2, 3, 4, 5],
    [0, 1, 2, 3, 4, 5],
    [0, 1, 2, 3, 4, 5],
  ];
  hasFlippedAll: boolean = false;
  showLander: boolean = false;
  countDown: number = 0;
  countDownInterval: any;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.hasFlippedAll) this.reverseFlipAll();
    if (document.body.clientWidth < 764) {
      this.klBoxes = [
        [0, 1, 2],
        [0, 1, 2],
        [0, 1, 2],
        [0, 1, 2],
        [0, 1, 2],
        [0, 1, 2],
      ];
    } else {
      this.klBoxes = [
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
        [0, 1, 2, 3, 4, 5],
      ];
    }
    this.initKlItems();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showLander = true;
      if (document.body.clientWidth < 764) {
        this.klBoxes = [
          [0, 1, 2],
          [0, 1, 2],
          [0, 1, 2],
          [0, 1, 2],
          [0, 1, 2],
          [0, 1, 2],
        ];
      } else {
        this.klBoxes = [
          [0, 1, 2, 3, 4, 5],
          [0, 1, 2, 3, 4, 5],
          [0, 1, 2, 3, 4, 5],
          [0, 1, 2, 3, 4, 5],
          [0, 1, 2, 3, 4, 5],
          [0, 1, 2, 3, 4, 5],
        ];
      }
      this.initKlItems(true);
    }, 4300);
    this.countDownInterval = setInterval(() => {
      this.countDown++;
      if (this.countDown == 100) clearInterval(this.countDownInterval);
    }, 33);
  }

  initKlItems(forceFlip?: true): void {
    try {
      setTimeout(() => {
        document.querySelectorAll('.kl_wrap_box').forEach((t: any) => {
          if (forceFlip) {
            if (this.hasFlippedAll) return;
            t?.setAttribute('data-hover', 'true');
            setTimeout(() => {
              t?.setAttribute('data-hover', 'false');
            }, 1000);
          }
          t.querySelectorAll('.box_component').forEach((e: any) => {
            if (window.matchMedia(`(max-width: ${768}px)`).matches) {
              const i = document.body.clientWidth,
                n = window.innerHeight,
                r = Math.min(i, n * (764 / 989)),
                s = r * (989 / 764),
                o =
                  (i / -3) * Number(t.style.getPropertyValue('--sp-pos-x')) +
                  0.5 * (i - r),
                a =
                  (n / -6) * Number(t.style.getPropertyValue('--sp-pos-y')) +
                  0.5 * (n - s);
              (e.style.backgroundSize = `${r}px ${s}px`),
                (e.style.backgroundPosition = `left ${o}px top ${a}px`);
            } else {
              const i = document.body.clientWidth,
                n = window.innerHeight,
                r = Math.min(i, n * (1536 / 975)),
                s = r * (975 / 1536),
                o =
                  (i / -6) * Number(t.style.getPropertyValue('--sp-pos-x')) +
                  0.5 * (i - r),
                a =
                  (n / -6) * Number(t.style.getPropertyValue('--sp-pos-y')) +
                  0.5 * (n - s);
              (e.style.backgroundSize = `${r}px ${s}px`),
                (e.style.backgroundPosition = `left ${o}px top ${a}px`);
            }
          });
        });
      });
    } catch (ex) {
      console.error(ex);
    }
  }

  onItemHover(klBox: Element): void {
    try {
      if (this.hasFlippedAll) return;
      klBox?.setAttribute('data-hover', 'true');
      setTimeout(() => {
        klBox?.setAttribute('data-hover', 'false');
      }, 1000);
    } catch (ex) {
      console.error(ex);
    }
  }

  flipAll(): void {
    try {
      if (this.hasFlippedAll) return;
      document
        .querySelector('.kamui_lander')
        .classList.add('kamui_lander-final');
      document.querySelector('.kl_wrap').classList.add('kl_wrap-final');
      document.querySelectorAll('.kl_wrap_box').forEach((e: any, i: number) => {
        setTimeout(() => {
          e?.setAttribute('data-turn', 'true');
        }, i * 10);
      });
      this.hasFlippedAll = true;
    } catch (ex) {
      console.error(ex);
    }
  }

  reverseFlipAll(): void {
    try {
      if (!this.hasFlippedAll) return;
      document
        .querySelector('.kamui_lander')
        .classList.remove('kamui_lander-final');
      document.querySelector('.kl_wrap').classList.remove('kl_wrap-final');
      document.querySelectorAll('.kl_wrap_box').forEach((e: any, i: number) => {
        e?.setAttribute('data-turn', 'false');
      });
      this.hasFlippedAll = false;
    } catch (ex) {
      console.error(ex);
    }
  }
}
