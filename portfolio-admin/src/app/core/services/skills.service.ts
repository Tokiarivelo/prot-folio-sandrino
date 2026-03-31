import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Skill {
  id?: string;
  name: string;
  level?: string;
  yearsExperience?: number;
  categoryId?: string;
  iconUrl?: string;
  order?: number;
}

export interface SkillCategory {
  id?: string;
  name: string;
  iconUrl?: string;
  order?: number;
  skills?: Skill[];
}

@Injectable({ providedIn: 'root' })
export class SkillsService {
  constructor(private api: ApiService) {}

  getCategories(): Observable<SkillCategory[]> {
    return this.api.get<SkillCategory[]>('/skills/categories/all');
  }

  createSkill(data: FormData): Observable<Skill> {
    return this.api.postFormData<Skill>('/skills', data);
  }

  updateSkill(id: string, data: FormData): Observable<Skill> {
    return this.api.patchFormData<Skill>(`/skills/${id}`, data);
  }

  deleteSkill(id: string): Observable<void> {
    return this.api.delete<void>(`/skills/${id}`);
  }

  createCategory(data: FormData): Observable<SkillCategory> {
    return this.api.postFormData<SkillCategory>('/skills/categories', data);
  }

  updateCategory(id: string, data: FormData): Observable<SkillCategory> {
    return this.api.patchFormData<SkillCategory>(`/skills/categories/${id}`, data);
  }

  deleteCategory(id: string): Observable<void> {
    return this.api.delete<void>(`/skills/categories/${id}`);
  }
}
