import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Wraps any form control with label + help/error text in the Aladdin style.
 * Children should be a native input/select/textarea — apply the
 * `.ui-control` class on them to get consistent styling, or use
 * UiInput / UiTextarea / UiSelect which already do.
 */
@Component({
  selector: 'ui-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (label()) {
      <label class="label" [attr.for]="for() || null">{{ label() }}
        @if (optional()) {
          <span class="optional">(valgfritt)</span>
        }
      </label>
    }
    <ng-content />
    @if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (hint()) {
      <p class="hint">{{ hint() }}</p>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
      }
      .label {
        font-family: var(--font-sans);
        font-size: 13px;
        font-weight: 600;
        color: var(--color-ink-mid);
      }
      .optional {
        margin-left: 6px;
        color: var(--color-ink-lo);
        font-weight: 500;
      }
      .hint {
        margin: 0;
        font-size: 12px;
        color: var(--color-ink-lo);
      }
      .error {
        margin: 0;
        font-size: 12px;
        color: var(--color-danger);
      }
    `
  ]
})
export class UiField {
  readonly label = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly optional = input(false);
  readonly for = input<string | null>(null);
}
