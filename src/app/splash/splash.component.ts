import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import gsap from 'gsap';

import { CacheStatus } from '../core/services/asset-cache.service';

const SPEED = 1.25;

const DEFAULT_STATUS: CacheStatus = {
  progress: 0,
  completed: 0,
  total: 0,
  phase: 'idle',
};

const PHASE_LABEL: Readonly<Record<CacheStatus['phase'], string>> = {
  idle: 'Preparing',
  downloading: 'Downloading',
  hydrating: 'Reading from cache',
  ready: 'Ready',
};

const KB = 1024;
const MB = KB * 1024;

@Component({
  selector: 'app-splash',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './splash.component.html',
  styleUrl: './splash.component.scss',
})
export class SplashComponent implements AfterViewInit {
  readonly status = input<CacheStatus>(DEFAULT_STATUS);

  protected readonly progressPercent = computed(() => {
    const value = this.status().progress;
    if (Number.isNaN(value)) return 0;
    return Math.max(0, Math.min(1, value)) * 100;
  });

  protected readonly phaseLabel = computed(() => PHASE_LABEL[this.status().phase]);

  protected readonly currentAssetName = computed(() => {
    const path = this.status().current;
    if (!path) return '';
    const slash = path.lastIndexOf('/');
    return slash >= 0 ? path.slice(slash + 1) : path;
  });

  protected readonly counterLabel = computed(() => {
    const { completed, total } = this.status();
    if (total <= 0) return '';
    return `${completed} / ${total}`;
  });

  protected readonly currentSizeLabel = computed(() => {
    const bytes = this.status().currentBytes;
    if (!bytes || bytes <= 0) return '';
    if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
    if (bytes >= KB) return `${Math.round(bytes / KB)} KB`;
    return `${bytes} B`;
  });

  ngAfterViewInit(): void {
    gsap.to('.splash_section .bar', {
      opacity: 1,
      stagger: 0.075,
      delay: 0.2 * SPEED,
      duration: 0.5 * SPEED,
      ease: 'power4.out',
      onComplete: () => this.settleBars(),
    });
  }

  private settleBars(): void {
    gsap.to('.splash_section .bar', {
      top: 'calc(calc(var(--ssjbari) - 1) * calc(1rem * var(--ssjscale)))',
      height:
        'calc(100% - var(--ssjbari) * calc(0.5rem * var(--ssjscale)))',
      stagger: 0.065,
      duration: 0.3 * SPEED,
      ease: 'power4.out',
      onComplete: () => this.startFillerLoop(),
    });
  }

  private startFillerLoop(): void {
    gsap.to('.splash_section .bar_enc1', {
      height: '100%',
      ease: 'power4.in',
      repeat: -1,
      repeatDelay: 2 * SPEED,
      bottom: 'unset',
      top: 0,
      duration: 0.75 * SPEED,
      delay: 0.2 * SPEED,
    });
    gsap.to('.splash_section .bar_enc2', {
      height: '100%',
      ease: 'power4.in',
      repeat: -1,
      repeatDelay: 2 * SPEED,
      bottom: 'unset',
      top: 0,
      duration: 0.75 * SPEED,
      delay: 0.5 * SPEED,
    });
  }
}
