import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JobListItem } from '../../features/jobs/jobs.types';
import { StatusBadge } from './status-badge';
import { UiBadge } from './ui-badge';
import { UiIcon } from './ui-icon';

@Component({
  selector: 'job-card',
  imports: [RouterLink, UiIcon, UiBadge, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="card" [routerLink]="['/jobs', item().id]">
      <div class="image" [class]="'tone-' + tone()">
        <span class="image-label">{{ item().categoryName.toLowerCase() }}</span>
      </div>
      <div class="body">
        <div class="header">
          <h3 class="title">{{ item().title }}</h3>
          <span class="price">{{ priceLabel() }}<small class="price-unit">{{ priceUnit() }}</small></span>
        </div>
        <div class="meta">
          <ui-icon name="pin" [size]="14" />
          <span>{{ item().postalCode }}{{ item().city ? ' · ' + item().city : '' }}</span>
          <span class="dot">·</span>
          <ui-icon name="clock" [size]="14" />
          <span>{{ deadlineLabel() }}</span>
        </div>
        <div class="tags">
          <ui-badge tone="gold">{{ item().categoryName }}</ui-badge>
          <status-badge [job]="item().status" />
        </div>
      </div>
    </a>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .card {
        display: block;
        overflow: hidden;
        border-radius: var(--radius-lg);
        background: var(--color-night-surface);
        border: 1px solid var(--color-line);
        text-decoration: none;
        color: inherit;
        transition:
          transform 0.12s ease,
          border-color 0.12s ease,
          box-shadow 0.12s ease;
      }
      .card:hover {
        border-color: var(--color-line-strong);
        box-shadow: var(--shadow-mid);
        transform: translateY(-1px);
      }
      .image {
        height: 140px;
        display: flex;
        align-items: flex-end;
        padding: 10px;
        position: relative;
      }
      .image.tone-gold {
        background: repeating-linear-gradient(135deg, #2a2658 0 12px, #3a3268 12px 24px);
      }
      .image.tone-teal {
        background: repeating-linear-gradient(135deg, #1a2a4a 0 12px, #244468 12px 24px);
      }
      .image.tone-plum {
        background: repeating-linear-gradient(135deg, #2b1a4e 0 12px, #3d2868 12px 24px);
      }
      .image-label {
        font-family: var(--font-mono);
        font-size: 10px;
        color: rgba(245, 234, 208, 0.55);
        background: rgba(0, 0, 0, 0.28);
        padding: 2px 6px;
        border-radius: 4px;
      }
      .body {
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }
      .title {
        margin: 0;
        font-size: 16px;
        line-height: 22px;
        font-weight: 700;
        color: var(--color-ink-hi);
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      .price {
        font-family: var(--font-sans);
        font-size: 18px;
        font-weight: 700;
        color: var(--color-gold);
        white-space: nowrap;
      }
      .price-unit {
        font-size: 12px;
        font-weight: 500;
        color: var(--color-ink-lo);
      }
      .meta {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--color-ink-mid);
      }
      .meta ui-icon {
        color: var(--color-ink-lo);
      }
      .meta .dot {
        color: var(--color-ink-lo);
      }
      .tags {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        padding-top: 4px;
      }
    `
  ]
})
export class JobCard {
  readonly item = input.required<JobListItem>();

  protected readonly tone = computed<'gold' | 'teal' | 'plum'>(() => {
    // Deterministisk tone-rotasjon basert på kategori-id
    const tones = ['gold', 'teal', 'plum'] as const;
    return tones[this.item().categoryId % tones.length];
  });

  protected readonly priceLabel = computed(() =>
    new Intl.NumberFormat('nb-NO', {
      maximumFractionDigits: 0
    }).format(this.item().price)
  );

  protected readonly priceUnit = computed(() => {
    const item = this.item();
    return item.priceModel === 'HourlyRate' ? ' kr/t' : ' kr';
  });

  protected readonly deadlineLabel = computed(() => {
    const h = this.item().estimatedHours;
    if (h <= 1) return 'Under 1 t';
    if (h < 8) return `${h} timer`;
    return `${Math.round(h / 8)} dager`;
  });
}
