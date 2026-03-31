import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
}

export interface SeoMetadata {
  title?: string;
  description?: string;
}

export interface Profile {
  id?: number;
  fullName: string;
  jobTitle: string;
  heroText?: string;
  shortBio?: string;
  longBio?: string;
  location?: string;
  availability?: boolean;
  resumePdfUrl?: string;
  profileImageUrl?: string;
  isPublic?: boolean;
  socialLinks?: SocialLinks;
  seoMetadata?: SeoMetadata;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private api: ApiService) {}

  getProfile(): Observable<Profile> {
    return this.api.get<Profile>('/profile/me');
  }

  createProfile(data: Profile): Observable<Profile> {
    return this.api.post<Profile>('/profile', data);
  }

  updateProfile(id: number, data: Partial<Profile>): Observable<Profile> {
    return this.api.patch<Profile>(`/profile/${id}`, data);
  }

  uploadImage(id: number, file: File): Observable<Profile> {
    const formData = new FormData();
    formData.append('image', file);
    return this.api.postFormData<Profile>(`/profile/${id}/image`, formData);
  }
}
