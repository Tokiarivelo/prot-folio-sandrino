import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ProjectMedia } from './projects.service';

export interface UploadMediaParams {
  file: File;
  projectId: string;
  fileType: string;
  isCover: boolean;
  caption?: string;
  order?: number;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  constructor(private api: ApiService) {}

  uploadMedia(params: UploadMediaParams): Observable<ProjectMedia> {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('projectId', params.projectId);
    formData.append('fileType', params.fileType);
    formData.append('isCover', String(params.isCover));
    if (params.caption) {
      formData.append('caption', params.caption);
    }
    if (params.order !== undefined) {
      formData.append('order', String(params.order));
    }
    return this.api.postFormData<ProjectMedia>('/project-media', formData);
  }

  deleteMedia(id: string): Observable<void> {
    return this.api.delete<void>(`/project-media/${id}`);
  }
}
