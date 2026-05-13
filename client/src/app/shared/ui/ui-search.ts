import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiIcon } from './ui-icon';

@Component({
  selector: 'ui-search',
  imports: [FormsModule, UiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="leading"><ui-icon name="search" [size]="20" /></span>
    <input
      type="search"
      [placeholder]="placeholder()"
      [ngModel]="value()"
      (ngModelChange)="valueChange.emit($event)"
    />
    @if (showFilter()) {
      <button type="button" class="filter" (click)="filterClick.emit()">
        <ui-icon name="filter" [size]="18" />
      </button>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 52px;
        padding: 0 18px;
        border-radius: 999px;
        background: var(--color-night-surface);
        box-shadow: var(--shadow-mid);
        border: 1px solid var(--color-line);
      }
      .leading {
        color: var(--color-gold);
        display: flex;
      }
      input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        font-family: var(--font-sans);
        font-size: 15px;
        font-weight: 500;
        color: var(--color-ink-hi);
      }
      input::placeholder {
        color: var(--color-ink-lo);
      }
      .filter {
        width: 36px;
        height: 36px;
        border-radius: 999px;
        background: var(--color-night-inset);
        color: var(--color-ink-mid);
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .filter:hover {
        color: var(--color-ink-hi);
      }
    `
  ]
})
export class UiSearch {
  readonly placeholder = input<string>('Søk etter småjobber');
  readonly value = input<string>('');
  readonly showFilter = input(true);

  readonly valueChange = output<string>();
  readonly filterClick = output<void>();
}
