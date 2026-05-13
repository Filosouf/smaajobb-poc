import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MessageDto } from './messages.types';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  list(jobId: string): Promise<MessageDto[]> {
    return firstValueFrom(
      this.http.get<MessageDto[]>(`${this.base}/jobs/${jobId}/messages`)
    );
  }

  send(jobId: string, body: string): Promise<MessageDto> {
    return firstValueFrom(
      this.http.post<MessageDto>(`${this.base}/jobs/${jobId}/messages`, { body })
    );
  }
}
