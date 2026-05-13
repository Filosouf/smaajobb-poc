import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { JobStatus } from '../../features/jobs/jobs.types';
import { ApplicationStatus } from '../../features/applications/applications.types';
import { BadgeTone, UiBadge } from './ui-badge';

interface BadgeSpec {
  label: string;
  tone: BadgeTone;
}

const JOB_STATUS: Record<JobStatus, BadgeSpec> = {
  Draft: { label: 'Kladd', tone: 'neutral' },
  AwaitingPayment: { label: 'Venter betaling', tone: 'gold' },
  Open: { label: 'Åpen', tone: 'success' },
  Assigned: { label: 'Tildelt', tone: 'teal' },
  AwaitingConfirmation: { label: 'Venter bekreftelse', tone: 'gold' },
  Completed: { label: 'Fullført', tone: 'neutral' },
  Cancelled: { label: 'Avbrutt', tone: 'neutral' },
  Disputed: { label: 'I tvist', tone: 'danger' }
};

const APP_STATUS: Record<ApplicationStatus, BadgeSpec> = {
  PendingGuardianApproval: { label: 'Venter foresatt', tone: 'neutral' },
  Pending: { label: 'Venter svar', tone: 'gold' },
  Accepted: { label: 'Akseptert', tone: 'success' },
  Rejected: { label: 'Avvist', tone: 'danger' },
  Withdrawn: { label: 'Trukket', tone: 'neutral' }
};

@Component({
  selector: 'status-badge',
  imports: [UiBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ui-badge [tone]="spec().tone">{{ spec().label }}</ui-badge>`
})
export class StatusBadge {
  readonly job = input<JobStatus | null>(null);
  readonly application = input<ApplicationStatus | null>(null);

  protected readonly spec = computed<BadgeSpec>(() => {
    const j = this.job();
    if (j) return JOB_STATUS[j];
    const a = this.application();
    if (a) return APP_STATUS[a];
    return { label: '—', tone: 'neutral' };
  });
}
