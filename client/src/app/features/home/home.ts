import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UiAvatar } from '../../shared/ui/ui-avatar';
import { UiButton } from '../../shared/ui/ui-button';
import { UiCard } from '../../shared/ui/ui-card';
import { UiIcon } from '../../shared/ui/ui-icon';
import { UiRating } from '../../shared/ui/ui-rating';
import { JobsService } from '../jobs/jobs.service';
import { JobListItem } from '../jobs/jobs.types';
import { JobCard } from '../../shared/ui/job-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, UiAvatar, UiButton, UiCard, UiIcon, UiRating, JobCard],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomePage implements OnInit {
  private readonly jobsApi = inject(JobsService);
  protected readonly auth = inject(AuthService);

  readonly recentJobs = signal<JobListItem[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      const items = await this.jobsApi.search({});
      this.recentJobs.set(items.slice(0, 4));
    } catch {
      // ignorer — hjemmesiden fungerer uten
    }
  }
}
