import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="lg-spark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="var(--color-gold)" />
          <stop offset="1" stop-color="var(--color-gold-deep)" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 L13.6 9.2 C13.85 10.3 14.7 11.15 15.8 11.4 L23 13 L15.8 14.6 C14.7 14.85 13.85 15.7 13.6 16.8 L12 24 L10.4 16.8 C10.15 15.7 9.3 14.85 8.2 14.6 L1 13 L8.2 11.4 C9.3 11.15 10.15 10.3 10.4 9.2 Z"
        fill="url(#lg-spark)"
      />
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
