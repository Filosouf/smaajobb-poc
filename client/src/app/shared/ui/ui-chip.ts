import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[class.selected]': 'selected()'
  },
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 14px;
        border-radius: 999px;
        background: transparent;
        color: var(--color-ink-mid);
        border: 1px solid var(--color-line-strong);
        font-family: var(--font-sans);
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
        transition: background 0.12s ease, color 0.12s ease;
      }
      :host.selected {
        background: var(--color-gold);
        color: var(--color-ink-inverse);
        border-color: transparent;
      }
      :host:hover:not(.selected) {
        background: var(--color-night-elevated);
        color: var(--color-ink-hi);
      }
    `
  ]
})
export class UiChip {
  readonly selected = input(false);
}
