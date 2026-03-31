import { apiFetch } from './client';
import type { SkillCategory } from '../types/skill';

export async function getSkillCategories(): Promise<SkillCategory[]> {
  try {
    return await apiFetch<SkillCategory[]>('/skills/categories/all', {
      next: { revalidate: 300 },
    });
  } catch (error) {
    console.error('[getSkillCategories] Failed to fetch skill categories:', error);
    return [];
  }
}
