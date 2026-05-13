import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeTone = 'gold' | 'teal' | 'success' | 'danger' | 'neutral' | 'plum';

@Component({
  selector: 'ui-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[class]': '"tone-" + tone()'
  },
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 999px;
        font-family: var(--font-sans);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        line-height: 1.2;
      }
      :host.tone-gold {
        background: var(--color-gold-soft);
        color: var(--color-gold);
      }
      :host.tone-teal {
        background: var(--color-teal-soft);
        color: var(--color-teal);
      }
      :host.tone-success {
        background: var(--color-success-soft);
        color: var(--color-success);
      }
      :host.tone-danger {
        background: var(--color-danger-soft);
        color: var(--color-danger);
      }
      :host.tone-neutral {
        background: var(--color-night-inset);
        color: var(--color-ink-mid);
      }
      :host.tone-plum {
        background: rgba(139, 95, 191, 0.18);
        color: var(--color-plum);
      }
    `
  ]
})
export class UiBadge {
  readonly tone = input<BadgeTone>('gold');
}
