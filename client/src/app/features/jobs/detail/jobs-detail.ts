import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { JobsService } from '../jobs.service';
import { JobDetail } from '../jobs.types';

@Component({
  selector: 'app-jobs-detail',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './jobs-detail.html'
})
export class JobsDetailPage {
  private readonly jobs = inject(JobsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  readonly job = signal<JobDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  readonly isOwner = computed(() => {
    const j = this.job();
    const u = this.auth.currentUser();
    return !!j && !!u && j.lister.id === u.id;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) void this.load(id);
    });
  }

  async load(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.job.set(await this.jobs.get(id));
    } catch {
      this.error.set('Kunne ikke laste jobben.');
    } finally {
      this.loading.set(false);
    }
  }

  async publish(): Promise<void> {
    const j = this.job();
    if (!j) return;
    this.busy.set(true);
    try {
      this.job.set(await this.jobs.publish(j.id));
    } finally {
      this.busy.set(false);
    }
  }

  async cancel(): Promise<void> {
    const j = this.job();
    if (!j || !confirm('Avbryt denne jobben?')) return;
    this.busy.set(true);
    try {
      this.job.set(await this.jobs.cancel(j.id));
    } finally {
      this.busy.set(false);
    }
  }

  async deleteDraft(): Promise<void> {
    const j = this.job();
    if (!j || !confirm('Slett denne kladden?')) return;
    this.busy.set(true);
    try {
      await this.jobs.deleteDraft(j.id);
      this.router.navigate(['/jobs/mine']);
    } finally {
      this.busy.set(false);
    }
  }

  priceLabel(j: JobDetail): string {
    const f = new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      maximumFractionDigits: 0
    }).format(j.price);
    return j.priceModel === 'HourlyRate' ? `${f} / time` : f;
  }

  deadlineLabel(j: JobDetail): string {
    if (j.deadlineType === 'OpenEnded') return 'Ingen frist';
    if (j.deadlineType === 'WithinDays') return `Innen ${j.deadlineDays} dager`;
    if (j.deadlineType === 'ByDate' && j.deadlineDate) {
      return new Intl.DateTimeFormat('nb-NO', { dateStyle: 'long' }).format(
        new Date(j.deadlineDate)
      );
    }
    return '—';
  }

  statusLabel(s: JobDetail['status']): string {
    const map: Record<JobDetail['status'], string> = {
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

  statusClass(s: JobDetail['status']): string {
    const map: Record<JobDetail['status'], string> = {
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
