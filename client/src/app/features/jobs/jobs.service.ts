import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CategoryDto,
  JobDetail,
  JobInput,
  JobListItem,
  JobSearchParams
} from './jobs.types';

@Injectable({ providedIn: 'root' })
export class JobsService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  listCategories(): Promise<CategoryDto[]> {
    return firstValueFrom(this.http.get<CategoryDto[]>(`${this.base}/categories`));
  }

  search(params: JobSearchParams): Promise<JobListItem[]> {
    let p = new HttpParams();
    if (params.categoryId != null) p = p.set('categoryId', params.categoryId);
    if (params.postalCode) p = p.set('postalCode', params.postalCode);
    if (params.minPrice != null) p = p.set('minPrice', params.minPrice);
    if (params.maxPrice != null) p = p.set('maxPrice', params.maxPrice);
    if (params.status) p = p.set('status', params.status);
    if (params.mineOnly) p = p.set('mineOnly', 'true');

    return firstValueFrom(
      this.http.get<JobListItem[]>(`${this.base}/jobs`, { params: p })
    );
  }

  get(id: string): Promise<JobDetail> {
    return firstValueFrom(this.http.get<JobDetail>(`${this.base}/jobs/${id}`));
  }

  create(input: JobInput): Promise<JobDetail> {
    return firstValueFrom(this.http.post<JobDetail>(`${this.base}/jobs`, input));
  }

  update(id: string, input: JobInput): Promise<JobDetail> {
    return firstValueFrom(this.http.put<JobDetail>(`${this.base}/jobs/${id}`, input));
  }

  publish(id: string): Promise<JobDetail> {
    return firstValueFrom(
      this.http.post<JobDetail>(`${this.base}/jobs/${id}/publish`, null)
    );
  }

  cancel(id: string): Promise<JobDetail> {
    return firstValueFrom(
      this.http.post<JobDetail>(`${this.base}/jobs/${id}/cancel`, null)
    );
  }

  complete(id: string): Promise<JobDetail> {
    return firstValueFrom(
      this.http.post<JobDetail>(`${this.base}/jobs/${id}/complete`, null)
    );
  }

  confirm(id: string): Promise<JobDetail> {
    return firstValueFrom(
      this.http.post<JobDetail>(`${this.base}/jobs/${id}/confirm`, null)
    );
  }

  deleteDraft(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/jobs/${id}`));
  }
}
