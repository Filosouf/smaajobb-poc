import { DecimalPipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { StatusBadge } from '../../../shared/ui/status-badge';
import { UiAvatar } from '../../../shared/ui/ui-avatar';
import { UiBadge } from '../../../shared/ui/ui-badge';
import { UiButton } from '../../../shared/ui/ui-button';
import { UiCard } from '../../../shared/ui/ui-card';
import { UiField } from '../../../shared/ui/ui-form-field';
import { UiIcon } from '../../../shared/ui/ui-icon';
import { UiRating } from '../../../shared/ui/ui-rating';
import { ApplicationsService } from '../../applications/applications.service';
import { ApplicationDto } from '../../applications/applications.types';
import { MessagesService } from '../../messages/messages.service';
import { MessageDto } from '../../messages/messages.types';
import { RatingsService } from '../../ratings/ratings.service';
import { JobRatingsDto } from '../../ratings/ratings.types';
import { JobsService } from '../jobs.service';
import { JobDetail } from '../jobs.types';

@Component({
  selector: 'app-jobs-detail',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DecimalPipe,
    StatusBadge,
    UiAvatar,
    UiBadge,
    UiButton,
    UiCard,
    UiField,
    UiIcon,
    UiRating
  ],
  templateUrl: './jobs-detail.html',
  styleUrl: './jobs-detail.scss'
})
export class JobsDetailPage {
  private readonly jobs = inject(JobsService);
  private readonly applications = inject(ApplicationsService);
  private readonly messages = inject(MessagesService);
  private readonly ratingsApi = inject(RatingsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly id = input.required<string>();

  readonly job = signal<JobDetail | null>(null);
  readonly applicationsList = signal<ApplicationDto[]>([]);
  readonly messagesList = signal<MessageDto[]>([]);
  readonly ratings = signal<JobRatingsDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  readonly applyOpen = signal(false);
  readonly applyForm = this.fb.nonNullable.group({
    message: ['', [Validators.required, Validators.minLength(5)]]
  });

  readonly messageForm = this.fb.nonNullable.group({
    body: ['', [Validators.required, Validators.minLength(1)]]
  });

  readonly rateOpen = signal(false);
  readonly rateForm = this.fb.nonNullable.group({
    score: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['']
  });

  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);
  readonly isOwner = computed(() => {
    const j = this.job();
    const id = this.currentUserId();
    return !!j && !!id && j.lister.id === id;
  });
  readonly isAssignedWorker = computed(() => {
    const j = this.job();
    const id = this.currentUserId();
    return !!j && !!id && j.assignedTo?.id === id;
  });
  readonly isParticipant = computed(() => this.isOwner() || this.isAssignedWorker());
  readonly hasApplied = computed(() => {
    const id = this.currentUserId();
    return !!id && this.applicationsList().some((a) => a.workerId === id);
  });
  readonly myApplication = computed<ApplicationDto | null>(() => {
    const id = this.currentUserId();
    return id ? this.applicationsList().find((a) => a.workerId === id) ?? null : null;
  });
  readonly canMessageList = computed(() => {
    const j = this.job();
    return !!j && this.isParticipant() && j.status !== 'Draft' && j.status !== 'Open';
  });
  readonly hasPendingApplications = computed(() =>
    this.applicationsList().some((a) => a.status === 'Pending')
  );

  readonly stars = [1, 2, 3, 4, 5];

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
      const job = await this.jobs.get(id);
      this.job.set(job);

      const tasks: Promise<unknown>[] = [
        this.loadRatings(id).catch(() => null)
      ];
      const myId = this.currentUserId();
      if (myId && job.lister.id === myId) {
        tasks.push(this.loadApplications(id).catch(() => null));
      }
      if (this.canMessageList()) {
        tasks.push(this.loadMessages(id).catch(() => null));
      }
      await Promise.all(tasks);
    } catch {
      this.error.set('Kunne ikke laste jobben.');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadApplications(jobId: string): Promise<void> {
    this.applicationsList.set(await this.applications.listForJob(jobId));
  }

  private async loadMessages(jobId: string): Promise<void> {
    this.messagesList.set(await this.messages.list(jobId));
  }

  private async loadRatings(jobId: string): Promise<void> {
    this.ratings.set(await this.ratingsApi.forJob(jobId));
  }

  // --- Eier-handlinger ---

  async publish(): Promise<void> {
    const j = this.job();
    if (!j) return;
    this.busy.set(true);
    try {
      const res = await this.jobs.publish(j.id);
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      this.job.set(res.job);
    } catch (err: unknown) {
      this.error.set(extractError(err) ?? 'Kunne ikke starte betalingen.');
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

  async confirmCompletion(): Promise<void> {
    const j = this.job();
    if (!j) return;
    this.busy.set(true);
    try {
      this.job.set(await this.jobs.confirm(j.id));
      await this.loadRatings(j.id);
    } finally {
      this.busy.set(false);
    }
  }

  async acceptApplication(appId: string): Promise<void> {
    const j = this.job();
    if (!j) return;
    this.busy.set(true);
    try {
      await this.applications.accept(appId);
      await this.load(j.id);
    } finally {
      this.busy.set(false);
    }
  }

  async rejectApplication(appId: string): Promise<void> {
    if (!confirm('Avvis denne søknaden?')) return;
    this.busy.set(true);
    try {
      const updated = await this.applications.reject(appId);
      this.applicationsList.update((list) =>
        list.map((a) => (a.id === appId ? updated : a))
      );
    } finally {
      this.busy.set(false);
    }
  }

  // --- Worker-handlinger ---

  toggleApplyForm(): void {
    this.applyOpen.update((v) => !v);
  }

  async submitApply(): Promise<void> {
    const j = this.job();
    if (!j || this.applyForm.invalid) {
      this.applyForm.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    try {
      await this.applications.apply(j.id, this.applyForm.getRawValue().message);
      this.applyOpen.set(false);
      this.applyForm.reset({ message: '' });
      await this.load(j.id);
    } catch (err: unknown) {
      this.error.set(extractError(err) ?? 'Kunne ikke sende søknad.');
    } finally {
      this.busy.set(false);
    }
  }

  async markCompleted(): Promise<void> {
    const j = this.job();
    if (!j) return;
    this.busy.set(true);
    try {
      this.job.set(await this.jobs.complete(j.id));
    } finally {
      this.busy.set(false);
    }
  }

  // --- Meldinger ---

  async sendMessage(): Promise<void> {
    const j = this.job();
    if (!j || this.messageForm.invalid) return;
    const body = this.messageForm.getRawValue().body.trim();
    if (!body) return;
    this.busy.set(true);
    try {
      const msg = await this.messages.send(j.id, body);
      this.messagesList.update((list) => [...list, msg]);
      this.messageForm.reset({ body: '' });
    } catch (err: unknown) {
      this.error.set(extractError(err) ?? 'Kunne ikke sende melding.');
    } finally {
      this.busy.set(false);
    }
  }

  // --- Ratings ---

  toggleRateForm(): void {
    this.rateOpen.update((v) => !v);
  }

  setScore(score: number): void {
    this.rateForm.controls.score.setValue(score);
  }

  async submitRating(): Promise<void> {
    const j = this.job();
    if (!j || this.rateForm.invalid) return;
    this.busy.set(true);
    try {
      const v = this.rateForm.getRawValue();
      await this.ratingsApi.rate(j.id, v.score, v.comment || null);
      this.rateOpen.set(false);
      this.rateForm.reset({ score: 5, comment: '' });
      await this.loadRatings(j.id);
    } catch (err: unknown) {
      this.error.set(extractError(err) ?? 'Kunne ikke lagre rating.');
    } finally {
      this.busy.set(false);
    }
  }

  // --- formatering ---

  priceFormatted(j: JobDetail): string {
    return new Intl.NumberFormat('nb-NO', {
      maximumFractionDigits: 0
    }).format(j.price);
  }

  priceUnit(j: JobDetail): string {
    return j.priceModel === 'HourlyRate' ? 'kr/time' : 'kr fast';
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

  formatTime(iso: string): string {
    return new Intl.DateTimeFormat('nb-NO', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(iso));
  }

  isMine(senderId: string): boolean {
    return senderId === this.currentUserId();
  }

  scrollToMessages(ev: Event): void {
    ev.preventDefault();
    document.getElementById('messages')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

function extractError(err: unknown): string | null {
  if (err && typeof err === 'object' && 'error' in err) {
    const body = (err as { error?: { error?: string } }).error;
    if (body?.error) return body.error;
  }
  return null;
}
