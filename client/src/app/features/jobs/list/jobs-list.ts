import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobsService } from '../jobs.service';
import { CategoryDto, JobListItem, JobSearchParams } from '../jobs.types';

@Component({
  selector: 'app-jobs-list',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './jobs-list.html'
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

  readonly filterForm = this.fb.nonNullable.group({
    categoryId: [''],
    postalCode: [''],
    minPrice: [''],
    maxPrice: ['']
  });

  async ngOnInit(): Promise<void> {
    try {
      const cats = await this.jobs.listCategories();
      this.categories.set(cats);
    } catch {
      // ignorer; bare filter blir tom
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
        categoryId: v.categoryId ? Number(v.categoryId) : undefined,
        postalCode: v.postalCode || undefined,
        minPrice: v.minPrice ? Number(v.minPrice) : undefined,
        maxPrice: v.maxPrice ? Number(v.maxPrice) : undefined
      };
      const items = await this.jobs.search(params);
      this.items.set(items);
    } catch {
      this.error.set('Kunne ikke laste jobber.');
    } finally {
      this.loading.set(false);
    }
  }

  resetFilter(): void {
    this.filterForm.reset();
    void this.refresh();
  }

  priceLabel(item: JobListItem): string {
    const formatted = new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      maximumFractionDigits: 0
    }).format(item.price);
    return item.priceModel === 'HourlyRate' ? `${formatted} / time` : formatted;
  }

  statusLabel(s: JobListItem['status']): string {
    const map: Record<JobListItem['status'], string> = {
      Draft: 'Kladd',
      AwaitingPayment: 'Venter på betaling',
      Open: 'Åpen',
      Assigned: 'Tildelt',
      AwaitingConfirmation: 'Venter bekreftelse',
      Completed: 'Fullført',
      Cancelled: 'Avbrutt',
      Disputed: 'I tvist'
    };
    return map[s];
  }

  statusClass(s: JobListItem['status']): string {
    const map: Record<JobListItem['status'], string> = {
      Draft: 'bg-slate-100 text-slate-700',
      AwaitingPayment: 'bg-amber-100 text-amber-800',
      Open: 'bg-green-100 text-green-800',
      Assigned: 'bg-blue-100 text-blue-800',
      AwaitingConfirmation: 'bg-blue-100 text-blue-800',
      Completed: 'bg-slate-200 text-slate-700',
      Cancelled: 'bg-slate-100 text-slate-500',
      Disputed: 'bg-red-100 text-red-800'
    };
    return map[s];
  }
}
