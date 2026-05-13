import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JobRatingsDto, RatingDto } from './ratings.types';

@Injectable({ providedIn: 'root' })
export class RatingsService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  forJob(jobId: string): Promise<JobRatingsDto> {
    return firstValueFrom(
      this.http.get<JobRatingsDto>(`${this.base}/jobs/${jobId}/ratings`)
    );
  }

  rate(jobId: string, score: number, comment: string | null): Promise<RatingDto> {
    return firstValueFrom(
      this.http.post<RatingDto>(`${this.base}/jobs/${jobId}/ratings`, {
        score,
        comment
      })
    );
  }

  forUser(userId: string): Promise<RatingDto[]> {
    return firstValueFrom(
      this.http.get<RatingDto[]>(`${this.base}/users/${userId}/ratings`)
    );
  }
}
