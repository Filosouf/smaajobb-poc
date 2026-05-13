import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="lg-moon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="var(--color-gold)" />
          <stop offset="1" stop-color="var(--color-gold-deep)" />
        </linearGradient>
      </defs>
      <path d="M16.5 4a9 9 0 1 0 3.5 14.5A8 8 0 0 1 16.5 4z" fill="url(#lg-moon)" />
      <circle cx="6" cy="6" r="1" fill="var(--color-gold)" opacity="0.7" />
      <circle cx="20" cy="11" r="0.8" fill="var(--color-gold)" opacity="0.5" />
    </svg>
    <span class="word" [style.fontSize.px]="textSize()">smaa<em>jobb</em></span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        line-height: 1;
      }
      .word {
        font-family: var(--font-display);
        color: var(--color-ink-hi);
        font-style: italic;
        font-weight: 500;
        line-height: 1;
      }
      .word em {
        color: var(--color-gold);
        font-style: italic;
      }
    `
  ]
})
export class UiLogo {
  readonly size = input<number>(22);
  protected readonly textSize = computed(() => Math.round(this.size() * 0.95));
}
