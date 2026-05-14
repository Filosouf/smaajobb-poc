import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadedBlob {
  key: string;
  publicUrl: string;
}

@Injectable({ providedIn: 'root' })
export class UploadsService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  async upload(file: File): Promise<UploadedBlob> {
    const form = new FormData();
    form.append('file', file);
    return firstValueFrom(
      this.http.post<UploadedBlob>(`${this.base}/uploads`, form)
    );
  }
}
