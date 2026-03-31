import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ContactMessage {
  id: string;
  senderName: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ContactListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContactListResponse {
  data: ContactMessage[];
  meta: ContactListMeta;
  unreadCount: number;
}

export interface GetMessagesParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(private api: ApiService) {}

  getMessages(params?: GetMessagesParams): Observable<ContactListResponse> {
    const queryParams: Record<string, string | number | boolean> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.isRead !== undefined) {
      queryParams['isRead'] = params.isRead;
    }
    return this.api.get<ContactListResponse>('/contact', queryParams);
  }

  markAsRead(id: string): Observable<ContactMessage> {
    return this.api.patch<ContactMessage>(`/contact/${id}/read`, {});
  }

  deleteMessage(id: string): Observable<void> {
    return this.api.delete<void>(`/contact/${id}`);
  }
}
