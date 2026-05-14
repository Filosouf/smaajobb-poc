import {
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UiButton } from '../../../shared/ui/ui-button';
import { UiCard } from '../../../shared/ui/ui-card';
import { UiField } from '../../../shared/ui/ui-form-field';
import { UiIcon } from '../../../shared/ui/ui-icon';
import { JobImageEntry, UiImageUpload } from '../../../shared/ui/ui-image-upload';
import { JobsService } from '../jobs.service';
import {
  CategoryDto,
  DeadlineType,
  JobInput,
  PriceModel
} from '../jobs.types';

@Component({
  selector: 'app-jobs-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    UiButton,
    UiCard,
    UiField,
    UiIcon,
    UiImageUpload
  ],
  templateUrl: './jobs-form.html',
  styleUrl: './jobs-form.scss'
})
export class JobsFormPage implements OnInit {
  private readonly jobs = inject(JobsService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly id = input<string | undefined>(undefined);
  readonly isEdit = computed(() => !!this.id());

  readonly categories = signal<CategoryDto[]>([]);
  readonly submitting = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly submitError = signal<string | null>(null);
  readonly images = signal<JobImageEntry[]>([]);

  readonly form = this.fb.nonNullable.group({
    categoryId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(4000)]],
    priceModel: ['FixedPrice' as PriceModel, Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    estimatedHours: [1, [Validators.required, Validators.min(0.1)]],
    deadlineType: ['WithinDays' as DeadlineType, Validators.required],
    deadlineDate: [''],
    deadlineDays: [7],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
  });

  async ngOnInit(): Promise<void> {
    try {
      this.categories.set(await this.jobs.listCategories());
    } catch {
      this.loadError.set('Kunne ikke laste kategorier.');
    }

    const id = this.id();
    if (id) {
      try {
        const j = await this.jobs.get(id);
        if (j.status !== 'Draft') {
          this.loadError.set('Kun kladd kan redigeres.');
          return;
        }
        this.form.patchValue({
          categoryId: String(j.categoryId),
          title: j.title,
          description: j.description,
          priceModel: j.priceModel,
          price: j.price,
          estimatedHours: j.estimatedHours,
          deadlineType: j.deadlineType,
          deadlineDate: j.deadlineDate ? j.deadlineDate.slice(0, 10) : '',
          deadlineDays: j.deadlineDays ?? 7,
          postalCode: j.postalCode
        });
        // Eksisterende bilder — vi har ikke blobKey, men URL-en peker
        // til /uploads/{key} så vi kan utlede key fra URL-en.
        this.images.set(
          j.images.map((img) => ({
            blobKey: img.url.replace(/^\/uploads\//, ''),
            publicUrl: img.url
          }))
        );
      } catch {
        this.loadError.set('Kunne ikke laste jobben.');
      }
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const input: JobInput = {
      categoryId: Number(v.categoryId),
      title: v.title.trim(),
      description: v.description.trim(),
      priceModel: v.priceModel,
      price: v.price,
      estimatedHours: v.estimatedHours,
      deadlineType: v.deadlineType,
      deadlineDate:
        v.deadlineType === 'ByDate' && v.deadlineDate
          ? new Date(v.deadlineDate).toISOString()
          : null,
      deadlineDays: v.deadlineType === 'WithinDays' ? Number(v.deadlineDays) : null,
      postalCode: v.postalCode,
      imageBlobKeys: this.images().map((i) => i.blobKey)
    };

    this.submitting.set(true);
    this.submitError.set(null);
    try {
      const id = this.id();
      const saved = id
        ? await this.jobs.update(id, input)
        : await this.jobs.create(input);
      this.router.navigate(['/jobs', saved.id]);
    } catch (err: unknown) {
      this.submitError.set(extractError(err) ?? 'Kunne ikke lagre.');
    } finally {
      this.submitting.set(false);
    }
  }
}

function extractError(err: unknown): string | null {
  if (err && typeof err === 'object' && 'error' in err) {
    const body = (err as { error?: { error?: string } }).error;
    if (body?.error) return body.error;
  }
  return null;
}
