import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationDto } from './applications.types';

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  listForJob(jobId: string): Promise<ApplicationDto[]> {
    return firstValueFrom(
      this.http.get<ApplicationDto[]>(`${this.base}/jobs/${jobId}/applications`)
    );
  }

  listMine(): Promise<ApplicationDto[]> {
    return firstValueFrom(
      this.http.get<ApplicationDto[]>(`${this.base}/applications/mine`)
    );
  }

  apply(jobId: string, message: string): Promise<ApplicationDto> {
    return firstValueFrom(
      this.http.post<ApplicationDto>(`${this.base}/jobs/${jobId}/applications`, {
        message
      })
    );
  }

  accept(appId: string): Promise<ApplicationDto> {
    return firstValueFrom(
      this.http.post<ApplicationDto>(`${this.base}/applications/${appId}/accept`, null)
    );
  }

  reject(appId: string): Promise<ApplicationDto> {
    return firstValueFrom(
      this.http.post<ApplicationDto>(`${this.base}/applications/${appId}/reject`, null)
    );
  }

  withdraw(appId: string): Promise<ApplicationDto> {
    return firstValueFrom(
      this.http.post<ApplicationDto>(`${this.base}/applications/${appId}/withdraw`, null)
    );
  }
}
