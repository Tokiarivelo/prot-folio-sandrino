import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface ProjectLink {
  id?: string;
  label: string;
  url: string;
  type: string;
}

export interface ProjectTag {
  tag: { id: string; name: string; slug: string };
}

export interface ProjectMedia {
  id?: string;
  projectId?: string;
  fileUrl: string;
  fileType: string;
  isCover: boolean;
  caption?: string;
  order?: number;
}

export interface Project {
  id?: string;
  title: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  status: 'PUBLISHED' | 'DRAFT';
  displayOrder?: number;
  projectTags?: ProjectTag[];
  links?: ProjectLink[];
  media?: ProjectMedia[];
}

export interface GetProjectsParams {
  page?: number;
  limit?: number;
  status?: string;
  tag?: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  constructor(private api: ApiService) {}

  getProjects(params?: GetProjectsParams): Observable<Project[]> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.status) queryParams['status'] = params.status;
    if (params?.tag) queryParams['tag'] = params.tag;

    return this.api
      .get<PaginatedResponse<Project>>('/projects', queryParams)
      .pipe(map((res) => res.data));
  }

  getProject(id: string): Observable<Project> {
    return this.api.get<Project>(`/projects/${id}`);
  }

  createProject(data: Omit<Project, 'id'>): Observable<Project> {
    return this.api.post<Project>('/projects', data);
  }

  updateProject(id: string, data: Partial<Project>): Observable<Project> {
    return this.api.patch<Project>(`/projects/${id}`, data);
  }

  deleteProject(id: string): Observable<void> {
    return this.api.delete<void>(`/projects/${id}`);
  }

  addLink(projectId: string, link: Omit<ProjectLink, 'id'>): Observable<ProjectLink> {
    return this.api.post<ProjectLink>(`/projects/${projectId}/links`, link);
  }

  removeLink(projectId: string, linkId: string): Observable<void> {
    return this.api.delete<void>(`/projects/${projectId}/links/${linkId}`);
  }
}
