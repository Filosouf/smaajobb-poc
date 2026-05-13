import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';
import { UiIcon } from './ui-icon';

export type AvatarTone = 'gold' | 'teal' | 'plum' | 'cream' | 'auto';

const TONES: Record<Exclude<AvatarTone, 'auto'>, [string, string]> = {
  gold: ['var(--color-gold)', 'var(--color-gold-deep)'],
  teal: ['var(--color-teal)', '#3A7E8C'],
  plum: ['var(--color-plum)', '#5B3F8A'],
  cream: ['var(--color-ink-hi)', '#C8B47E']
};

@Component({
  selector: 'ui-avatar',
  imports: [UiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bubble" [style.background]="gradient()">
      <span class="initials" [style.fontSize.px]="fontSize()">{{ initials() }}</span>
    </div>
    @if (verified()) {
      <div class="check" [style.width.px]="badgeSize()" [style.height.px]="badgeSize()">
        <ui-icon name="check" [size]="badgeSize() - 6" />
      </div>
    }
  `,
  host: {
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()'
  },
  styles: [
    `
      :host {
        position: relative;
        display: inline-flex;
        flex-shrink: 0;
      }
      .bubble {
        width: 100%;
        height: 100%;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-sans);
        font-weight: 700;
        color: var(--color-ink-inverse);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }
      .check {
        position: absolute;
        bottom: -2px;
        right: -2px;
        border-radius: 999px;
        background: var(--color-success);
        color: var(--color-ink-inverse);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--color-night-base);
      }
    `
  ]
})
export class UiAvatar {
  readonly name = input<string>('?');
  readonly size = input<number>(40);
  readonly tone = input<AvatarTone>('gold');
  readonly verified = input(false);

  protected readonly initials = computed(() => {
    const n = this.name().trim();
    if (!n || n === '?') return '?';
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  protected readonly fontSize = computed(() => Math.round(this.size() * 0.4));
  protected readonly badgeSize = computed(() => Math.round(this.size() * 0.4));

  protected readonly gradient = computed(() => {
    const t = this.tone();
    const key: Exclude<AvatarTone, 'auto'> =
      t === 'auto' ? this.pickTone() : t;
    const [a, b] = TONES[key];
    return `linear-gradient(135deg, ${a}, ${b})`;
  });

  private pickTone(): Exclude<AvatarTone, 'auto'> {
    const palette: Exclude<AvatarTone, 'auto'>[] = ['gold', 'teal', 'plum', 'cream'];
    const seed = this.name()
      .split('')
      .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return palette[seed % palette.length];
  }
}
