import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type CardVariant = 'default' | 'elevated' | 'flat';

@Component({
  selector: 'ui-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[class]': '"variant-" + variant() + (padding() ? " p-" + padding() : "")'
  },
  styles: [
    `
      :host {
        display: block;
        border-radius: var(--radius-lg);
        background: var(--color-night-surface);
        border: 1px solid var(--color-line);
      }
      :host.variant-elevated {
        background: var(--color-night-elevated);
        box-shadow: var(--shadow-mid);
      }
      :host.variant-flat {
        background: transparent;
        border-color: var(--color-line);
      }
      :host.p-sm {
        padding: 12px;
      }
      :host.p-md {
        padding: 16px;
      }
      :host.p-lg {
        padding: 20px;
      }
      :host.p-xl {
        padding: 24px;
      }
    `
  ]
})
export class UiCard {
  readonly variant = input<CardVariant>('default');
  readonly padding = input<'sm' | 'md' | 'lg' | 'xl' | null>('lg');
}
