import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobCard } from '../../../shared/ui/job-card';
import { UiButton } from '../../../shared/ui/ui-button';
import { UiCard } from '../../../shared/ui/ui-card';
import { UiChip } from '../../../shared/ui/ui-chip';
import { UiField } from '../../../shared/ui/ui-form-field';
import { UiIcon } from '../../../shared/ui/ui-icon';
import { JobsService } from '../jobs.service';
import { CategoryDto, JobListItem, JobSearchParams } from '../jobs.types';

@Component({
  selector: 'app-jobs-list',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    JobCard,
    UiButton,
    UiCard,
    UiChip,
    UiField,
    UiIcon
  ],
  templateUrl: './jobs-list.html',
  styleUrl: './jobs-list.scss'
})
export class JobsList implements OnInit {
  private readonly jobs = inject(JobsService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly mineOnly = signal(this.route.snapshot.data['mineOnly'] === true);
  readonly title = computed(() =>
    this.mineOnly() ? 'Mine jobber' : 'Tilgjengelige jobber'
  );

  readonly categories = signal<CategoryDto[]>([]);
  readonly items = signal<JobListItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly selectedCategoryId = signal<number | null>(null);

  readonly filterForm = this.fb.nonNullable.group({
    postalCode: [''],
    minPrice: [''],
    maxPrice: ['']
  });

  async ngOnInit(): Promise<void> {
    try {
      this.categories.set(await this.jobs.listCategories());
    } catch {
      // ignorer
    }
    await this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const v = this.filterForm.getRawValue();
      const params: JobSearchParams = {
        mineOnly: this.mineOnly() || undefined,
        categoryId: this.selectedCategoryId() ?? undefined,
        postalCode: v.postalCode || undefined,
        minPrice: v.minPrice ? Number(v.minPrice) : undefined,
        maxPrice: v.maxPrice ? Number(v.maxPrice) : undefined
      };
      this.items.set(await this.jobs.search(params));
    } catch {
      this.error.set('Kunne ikke laste jobber.');
    } finally {
      this.loading.set(false);
    }
  }

  selectCategory(id: number | null): void {
    this.selectedCategoryId.set(id);
    void this.refresh();
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.selectedCategoryId.set(null);
    void this.refresh();
  }
}
