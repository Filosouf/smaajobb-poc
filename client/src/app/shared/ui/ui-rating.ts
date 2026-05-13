import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UiIcon } from './ui-icon';

@Component({
  selector: 'ui-rating',
  imports: [UiIcon, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="star"><ui-icon name="star" [size]="size()" /></span>
    <span class="value" [style.fontSize.px]="textSize()">
      {{ value() | number: '1.1-1' }}
    </span>
    @if (count() != null) {
      <span class="count" [style.fontSize.px]="textSize()">({{ count() }})</span>
    }
  `,
  host: {
    '[style.--rating-text-size.px]': 'textSize()'
  },
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--color-ink-hi);
        font-family: var(--font-sans);
        line-height: 1.2;
      }
      .star {
        color: var(--color-gold);
        display: inline-flex;
      }
      .value {
        font-weight: 700;
      }
      .count {
        color: var(--color-ink-lo);
        font-weight: 500;
      }
    `
  ]
})
export class UiRating {
  readonly value = input.required<number>();
  readonly count = input<number | null>(null);
  readonly size = input<number>(14);
  readonly textSize = input<number>(13);
}
