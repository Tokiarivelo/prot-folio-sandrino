import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Tool {
  id: string;
  name: string;
  iconUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ToolsService {
  constructor(private api: ApiService) {}

  getTools(): Observable<Tool[]> {
    return this.api.get<Tool[]>('/tools');
  }

  createTool(formData: FormData): Observable<Tool> {
    return this.api.postFormData<Tool>('/tools', formData);
  }

  updateTool(id: string, formData: FormData): Observable<Tool> {
    return this.api.patchFormData<Tool>(`/tools/${id}`, formData);
  }

  deleteTool(id: string): Observable<void> {
    return this.api.delete<void>(`/tools/${id}`);
  }

  reorderTools(reorderings: { id: string; order: number }[]): Observable<void> {
    return this.api.post<void>('/tools/reorder', { reorderings });
  }
}
