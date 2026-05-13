import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'danger-ghost'
  | 'teal-soft';

export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button, button[ui-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type()',
    '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null'
  },
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: var(--font-sans);
        font-weight: 600;
        letter-spacing: -0.005em;
        white-space: nowrap;
        cursor: pointer;
        border: 1px solid transparent;
        transition:
          transform 0.12s ease,
          background-color 0.12s ease,
          color 0.12s ease,
          box-shadow 0.12s ease;
        user-select: none;
      }

      :host:active:not([disabled]) {
        transform: translateY(1px);
      }

      :host[disabled] {
        opacity: 0.55;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* sizes */
      :host.size-sm {
        height: 32px;
        padding: 0 14px;
        font-size: 13px;
        border-radius: 999px;
      }
      :host.size-md {
        height: 40px;
        padding: 0 18px;
        font-size: 15px;
        border-radius: 999px;
      }
      :host.size-lg {
        height: 48px;
        padding: 0 24px;
        font-size: 16px;
        border-radius: 999px;
      }

      /* variants */
      :host.variant-primary {
        background: var(--color-gold);
        color: var(--color-ink-inverse);
        border-color: transparent;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.25),
          0 1px 2px rgba(0, 0, 0, 0.25);
      }
      :host.variant-primary:hover:not([disabled]) {
        background: var(--color-gold-hover);
      }

      :host.variant-secondary {
        background: transparent;
        color: var(--color-ink-hi);
        border-color: var(--color-line-strong);
      }
      :host.variant-secondary:hover:not([disabled]) {
        background: var(--color-night-elevated);
      }

      :host.variant-ghost {
        background: transparent;
        color: var(--color-ink-hi);
        border-color: transparent;
      }
      :host.variant-ghost:hover:not([disabled]) {
        background: var(--color-night-elevated);
      }

      :host.variant-danger {
        background: var(--color-danger);
        color: var(--color-ink-inverse);
        border-color: transparent;
      }

      :host.variant-danger-ghost {
        background: transparent;
        color: var(--color-danger);
        border-color: var(--color-danger);
      }
      :host.variant-danger-ghost:hover:not([disabled]) {
        background: var(--color-danger-soft);
      }

      :host.variant-teal-soft {
        background: var(--color-teal-soft);
        color: var(--color-teal);
        border-color: transparent;
      }

      :host.full {
        width: 100%;
      }
    `
  ]
})
export class UiButton {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly full = input(false);
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  protected readonly classes = computed(() =>
    [
      `variant-${this.variant()}`,
      `size-${this.size()}`,
      this.full() ? 'full' : ''
    ]
      .filter(Boolean)
      .join(' ')
  );
}
