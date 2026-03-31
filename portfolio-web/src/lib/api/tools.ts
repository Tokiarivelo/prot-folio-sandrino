import { apiFetch } from './client';
import type { Tool } from '../types/tool';

export async function getTools(): Promise<Tool[]> {
  try {
    return await apiFetch<Tool[]>('/tools?activeOnly=true', {
      next: { revalidate: 300 },
    });
  } catch (error) {
    console.error('[getTools] Failed to fetch tools:', error);
    return [];
  }
}
