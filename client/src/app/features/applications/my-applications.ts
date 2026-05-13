import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApplicationsService } from './applications.service';
import { ApplicationDto, ApplicationStatus } from './applications.types';

@Component({
  selector: 'app-my-applications',
  imports: [RouterLink],
  templateUrl: './my-applications.html'
})
export class MyApplicationsPage implements OnInit {
  private readonly applications = inject(ApplicationsService);

  readonly items = signal<ApplicationDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      this.items.set(await this.applications.listMine());
    } catch {
      this.error.set('Kunne ikke laste søknadene dine.');
    } finally {
      this.loading.set(false);
    }
  }

  async withdraw(id: string): Promise<void> {
    if (!confirm('Trekk denne søknaden?')) return;
    this.busy.set(true);
    try {
      const updated = await this.applications.withdraw(id);
      this.items.update((list) => list.map((a) => (a.id === id ? updated : a)));
    } catch {
      // ignorer
    } finally {
      this.busy.set(false);
    }
  }

  statusLabel(s: ApplicationStatus): string {
    const map: Record<ApplicationStatus, string> = {
      PendingGuardianApproval: 'Venter foresatt',
      Pending: 'Venter på svar',
      Accepted: 'Akseptert',
      Rejected: 'Avvist',
      Withdrawn: 'Trukket'
    };
    return map[s];
  }

  statusClass(s: ApplicationStatus): string {
    const map: Record<ApplicationStatus, string> = {
      PendingGuardianApproval: 'bg-slate-100 text-slate-700',
      Pending: 'bg-amber-100 text-amber-800',
      Accepted: 'bg-green-100 text-green-800',
      Rejected: 'bg-slate-200 text-slate-600',
      Withdrawn: 'bg-slate-100 text-slate-500'
    };
    return map[s];
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat('nb-NO', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(iso));
  }
}
