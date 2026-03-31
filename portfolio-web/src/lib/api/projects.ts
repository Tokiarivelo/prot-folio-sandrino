import { apiFetch } from './client';
import type { PaginatedProjects, Project } from '../types/project';

export async function getProjects(params?: {
  status?: string;
  limit?: number;
  page?: number;
}): Promise<PaginatedProjects> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.page) query.set('page', String(params.page));

  const queryString = query.toString();
  const path = `/projects${queryString ? `?${queryString}` : ''}`;

  try {
    return await apiFetch<PaginatedProjects>(path, {
      next: { revalidate: 300 },
    });
  } catch (error) {
    console.error('[getProjects] Failed to fetch projects:', error);
    return { data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 0 } };
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    return await apiFetch<Project>(`/projects/${slug}`, {
      next: { revalidate: 300 },
    });
  } catch (error) {
    console.error(`[getProjectBySlug] Failed to fetch project "${slug}":`, error);
    return null;
  }
}

export async function getPublishedProjectSlugs(): Promise<string[]> {
  const result = await getProjects({ status: 'PUBLISHED', limit: 100 });
  return result.data.map((p) => p.slug);
}
