import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'search'
  | 'filter'
  | 'star'
  | 'star-outline'
  | 'pin'
  | 'clock'
  | 'bolt'
  | 'heart'
  | 'heart-filled'
  | 'chev-right'
  | 'chev-left'
  | 'home'
  | 'message'
  | 'user'
  | 'briefcase'
  | 'plus'
  | 'check'
  | 'shield'
  | 'sparkle'
  | 'logout'
  | 'pen'
  | 'trash'
  | 'cancel'
  | 'card';

@Component({
  selector: 'ui-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (name()) {
      @case ('search') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      }
      @case ('filter') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <path d="M3 6h18M6 12h12M10 18h4" />
        </svg>
      }
      @case ('star') {
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.4"
          stroke-linejoin="round" [attr.width]="size()" [attr.height]="size()">
          <path d="M12 3l2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.8 6.5 20.3l1.1-6.3L3 9.6l6.3-.9L12 3z" />
        </svg>
      }
      @case ('star-outline') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linejoin="round" [attr.width]="size()" [attr.height]="size()">
          <path d="M12 3l2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.8 6.5 20.3l1.1-6.3L3 9.6l6.3-.9L12 3z" />
        </svg>
      }
      @case ('pin') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      }
      @case ('clock') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      }
      @case ('bolt') {
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"
          stroke-linejoin="round" [attr.width]="size()" [attr.height]="size()">
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
        </svg>
      }
      @case ('heart') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linejoin="round" [attr.width]="size()" [attr.height]="size()">
          <path d="M20.8 7.6a5 5 0 0 0-8.8-2.4A5 5 0 1 0 3.2 12c.7 4 8.8 9 8.8 9s8.1-5 8.8-9c.4-1.6.4-3 0-4.4z" />
        </svg>
      }
      @case ('heart-filled') {
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"
          stroke-linejoin="round" [attr.width]="size()" [attr.height]="size()">
          <path d="M20.8 7.6a5 5 0 0 0-8.8-2.4A5 5 0 1 0 3.2 12c.7 4 8.8 9 8.8 9s8.1-5 8.8-9c.4-1.6.4-3 0-4.4z" />
        </svg>
      }
      @case ('chev-right') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <path d="m9 6 6 6-6 6" />
        </svg>
      }
      @case ('chev-left') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <path d="m15 6-6 6 6 6" />
        </svg>
      }
      @case ('home') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
        </svg>
      }
      @case ('message') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <path d="M21 12a8 8 0 0 1-11.6 7.2L4 21l1.4-4.8A8 8 0 1 1 21 12z" />
        </svg>
      }
      @case ('user') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </svg>
      }
      @case ('briefcase') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
      }
      @case ('plus') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
          stroke-linecap="round" [attr.width]="size()" [attr.height]="size()">
          <path d="M12 5v14M5 12h14" />
        </svg>
      }
      @case ('check') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <path d="m5 12 5 5L20 7" />
        </svg>
      }
      @case ('shield') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      }
      @case ('sparkle') {
        <svg viewBox="0 0 24 24" fill="currentColor"
          [attr.width]="size()" [attr.height]="size()">
          <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z" />
        </svg>
      }
      @case ('logout') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      }
      @case ('pen') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
        </svg>
      }
      @case ('trash') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
        </svg>
      }
      @case ('cancel') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6M9 9l6 6" />
        </svg>
      }
      @case ('card') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          [attr.width]="size()" [attr.height]="size()">
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 10h18M7 15h3" />
        </svg>
      }
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
      }
    `
  ]
})
export class UiIcon {
  readonly name = input.required<IconName>();
  readonly size = input<number>(20);
}
