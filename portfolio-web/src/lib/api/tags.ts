import { apiFetch } from './client';
import type { Tag } from '../types/skill';

export async function getTags(): Promise<Tag[]> {
  try {
    return await apiFetch<Tag[]>('/tags', {
      next: { revalidate: 300 },
    });
  } catch (error) {
    console.error('[getTags] Failed to fetch tags:', error);
    return [];
  }
}
