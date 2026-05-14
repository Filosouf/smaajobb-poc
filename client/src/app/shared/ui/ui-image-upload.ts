import {
  Component,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild
} from '@angular/core';
import { UploadsService } from '../../core/uploads/uploads.service';
import { UiIcon } from './ui-icon';

export interface JobImageEntry {
  blobKey: string;
  publicUrl: string;
}

@Component({
  selector: 'ui-image-upload',
  imports: [UiIcon],
  template: `
    <div class="grid">
      @for (img of value(); track img.blobKey; let i = $index) {
        <div class="tile">
          <img [src]="resolveSrc(img.publicUrl)" alt="" />
          @if (i === 0) {
            <span class="badge">Hovedbilde</span>
          }
          <button type="button" class="remove" (click)="remove(i)" aria-label="Fjern bilde">
            <ui-icon name="cancel" [size]="14" />
          </button>
        </div>
      }

      @if (value().length < max()) {
        <button
          type="button"
          class="add"
          (click)="trigger()"
          [disabled]="uploading()"
        >
          @if (uploading()) {
            <div class="spinner"></div>
            <span>Laster opp …</span>
          } @else {
            <ui-icon name="plus" [size]="22" />
            <span>Legg til bilde</span>
            <span class="hint">{{ value().length }}/{{ max() }}</span>
          }
        </button>
      }
    </div>

    @if (error()) {
      <p class="error">{{ error() }}</p>
    }

    <input
      #fileInput
      type="file"
      accept="image/*"
      multiple
      (change)="onFiles($event)"
      hidden
    />
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 12px;
      }

      .tile {
        position: relative;
        aspect-ratio: 4 / 3;
        border-radius: var(--radius-md);
        overflow: hidden;
        background: var(--color-night-inset);
        border: 1px solid var(--color-line);
      }

      .tile img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .badge {
        position: absolute;
        bottom: 8px;
        left: 8px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 999px;
        background: var(--color-gold);
        color: var(--color-ink-inverse);
      }

      .remove {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 28px;
        height: 28px;
        border-radius: 999px;
        border: none;
        background: rgba(14, 18, 53, 0.75);
        backdrop-filter: blur(8px);
        color: var(--color-ink-hi);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .remove:hover {
        background: var(--color-danger);
      }

      .add {
        aspect-ratio: 4 / 3;
        border-radius: var(--radius-md);
        border: 1px dashed var(--color-line-strong);
        background: var(--color-night-inset);
        color: var(--color-ink-mid);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        transition:
          background 0.12s ease,
          color 0.12s ease,
          border-color 0.12s ease;
      }

      .add:hover:not(:disabled) {
        color: var(--color-gold);
        border-color: var(--color-gold);
        background: var(--color-gold-soft);
      }

      .add:disabled {
        cursor: wait;
        opacity: 0.7;
      }

      .add .hint {
        font-size: 11px;
        color: var(--color-ink-lo);
        font-weight: 500;
      }

      .spinner {
        width: 22px;
        height: 22px;
        border: 2px solid var(--color-line);
        border-top-color: var(--color-gold);
        border-radius: 999px;
        animation: spin 0.7s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .error {
        margin: 8px 0 0;
        font-size: 12px;
        color: var(--color-danger);
      }
    `
  ]
})
export class UiImageUpload {
  private readonly uploads = inject(UploadsService);

  readonly value = model<JobImageEntry[]>([]);
  readonly max = input<number>(5);
  readonly apiBase = input<string>('/api');

  protected readonly uploading = signal(false);
  protected readonly error = signal<string | null>(null);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  trigger(): void {
    this.fileInput()?.nativeElement.click();
  }

  async onFiles(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = ''; // reset for å tillate samme fil igjen

    if (files.length === 0) return;

    this.error.set(null);
    this.uploading.set(true);
    try {
      const room = this.max() - this.value().length;
      const accepted = files.slice(0, room);
      const uploaded: JobImageEntry[] = [];
      for (const file of accepted) {
        try {
          const blob = await this.uploads.upload(file);
          uploaded.push({ blobKey: blob.key, publicUrl: blob.publicUrl });
        } catch (err: unknown) {
          this.error.set(extractError(err) ?? `Kunne ikke laste opp ${file.name}.`);
        }
      }
      if (uploaded.length > 0) {
        this.value.update((prev) => [...prev, ...uploaded]);
      }
    } finally {
      this.uploading.set(false);
    }
  }

  remove(index: number): void {
    this.value.update((prev) => prev.filter((_, i) => i !== index));
  }

  /**
   * publicUrl er server-relativ (/uploads/...). Gjør den absolutt mot
   * Angular dev-proxy / current origin så img.src fungerer overalt.
   */
  resolveSrc(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    return url.startsWith('/') ? url : `/${url}`;
  }
}

function extractError(err: unknown): string | null {
  if (err && typeof err === 'object' && 'error' in err) {
    const body = (err as { error?: { error?: string } }).error;
    if (body?.error) return body.error;
  }
  return null;
}
