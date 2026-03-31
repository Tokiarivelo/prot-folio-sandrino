import { apiFetch } from './client';
import type { Profile } from '../types/profile';

export async function getProfile(): Promise<Profile | null> {
  try {
    return await apiFetch<Profile>('/profile/current', {
      next: { revalidate: 300 },
    });
  } catch (error) {
    console.error('[getProfile] Failed to fetch profile:', error);
    return null;
  }
}
