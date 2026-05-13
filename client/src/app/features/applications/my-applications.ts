import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatusBadge } from '../../shared/ui/status-badge';
import { UiButton } from '../../shared/ui/ui-button';
import { UiCard } from '../../shared/ui/ui-card';
import { ApplicationsService } from './applications.service';
import { ApplicationDto } from './applications.types';

@Component({
  selector: 'app-my-applications',
  imports: [RouterLink, StatusBadge, UiButton, UiCard],
  templateUrl: './my-applications.html',
  styleUrl: './my-applications.scss'
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

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat('nb-NO', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(iso));
  }
}
