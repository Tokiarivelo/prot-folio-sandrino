import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ContactService } from './contact.service';
import { environment } from '../../../environments/environment';

describe('ContactService', () => {
  let service: ContactService;
  let httpMock: HttpTestingController;

  const mockApiResponse = {
    data: [
      {
        id: 'msg-uuid-1',
        senderName: 'Alice',
        email: 'alice@example.com',
        subject: 'Hello',
        message: 'Hi there',
        isRead: false,
        createdAt: '2026-03-01T00:00:00.000Z',
      },
    ],
    meta: { total: 5, page: 1, limit: 20, totalPages: 1 },
    unreadCount: 3,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ContactService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ContactService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getMessages()', () => {
    it('should return response with data array and meta', async () => {
      const promise = firstValueFrom(service.getMessages());
      httpMock.expectOne((r) => r.url === `${environment.apiUrl}/contact`).flush(mockApiResponse);
      const res = await promise;

      expect(Array.isArray(res.data)).toBeTrue();
      expect(res.data.length).toBe(1);
      expect(res.meta.total).toBe(5);
      expect(res.unreadCount).toBe(3);
    });

    it('should expose meta.total (not top-level total)', async () => {
      const promise = firstValueFrom(service.getMessages({ isRead: false, limit: 1 }));
      httpMock.expectOne((r) => r.url === `${environment.apiUrl}/contact`).flush(mockApiResponse);
      const res = await promise;

      // Shell uses res.meta.total — must not be undefined
      expect(res.meta).toBeDefined();
      expect(res.meta.total).toBe(5);
    });
  });
});
