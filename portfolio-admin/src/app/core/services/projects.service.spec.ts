import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ProjectsService } from './projects.service';
import { environment } from '../../../environments/environment';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let httpMock: HttpTestingController;

  const mockPaginatedResponse = {
    data: [
      {
        id: 'f058cb95-dfcb-4e96-9c08-3d56bda6a90d',
        title: 'E-commerce Platform',
        slug: 'e-commerce-platform',
        shortDescription: 'A modern e-commerce solution',
        status: 'DRAFT',
        displayOrder: 0,
        projectTags: [
          { tag: { id: 'tag-1', name: 'react', slug: 'react' } },
          { tag: { id: 'tag-2', name: 'nodejs', slug: 'nodejs' } },
        ],
        media: [
          {
            id: 'media-1',
            projectId: 'f058cb95-dfcb-4e96-9c08-3d56bda6a90d',
            fileUrl: 'https://example.supabase.co/storage/v1/object/public/cover.jpg',
            fileType: 'IMAGE',
            isCover: true,
            order: 0,
          },
        ],
        links: [],
      },
    ],
    meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ProjectsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ProjectsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getProjects()', () => {
    it('should return an array of projects (not the paginated wrapper)', async () => {
      const promise = firstValueFrom(service.getProjects());
      httpMock.expectOne(`${environment.apiUrl}/projects`).flush(mockPaginatedResponse);
      const projects = await promise;

      expect(Array.isArray(projects)).toBeTrue();
      expect(projects.length).toBe(1);
      expect(projects[0].title).toBe('E-commerce Platform');
    });

    it('should expose projectTags on each project', async () => {
      const promise = firstValueFrom(service.getProjects());
      httpMock.expectOne(`${environment.apiUrl}/projects`).flush(mockPaginatedResponse);
      const projects = await promise;

      expect(projects[0].projectTags).toBeDefined();
      expect(projects[0].projectTags!.length).toBe(2);
      expect(projects[0].projectTags![0].tag.name).toBe('react');
    });

    it('should not throw when spreading the returned array', async () => {
      const promise = firstValueFrom(service.getProjects());
      httpMock.expectOne(`${environment.apiUrl}/projects`).flush(mockPaginatedResponse);
      const projects = await promise;

      // Simulates what project-list.component does: [...projects].sort(...) must not throw
      expect(() =>
        [...projects].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      ).not.toThrow();
    });

    it('project id should be a string (UUID)', async () => {
      const promise = firstValueFrom(service.getProjects());
      httpMock.expectOne(`${environment.apiUrl}/projects`).flush(mockPaginatedResponse);
      const projects = await promise;

      expect(typeof projects[0].id).toBe('string');
    });

    it('project media should have fileUrl property', async () => {
      const promise = firstValueFrom(service.getProjects());
      httpMock.expectOne(`${environment.apiUrl}/projects`).flush(mockPaginatedResponse);
      const projects = await promise;

      const media = projects[0].media![0];
      expect(media.fileUrl).toBeDefined();
      expect(media.fileUrl).toContain('supabase.co');
    });
  });

  describe('deleteProject()', () => {
    it('should accept a string id', async () => {
      const stringId = 'f058cb95-dfcb-4e96-9c08-3d56bda6a90d';
      const promise = firstValueFrom(service.deleteProject(stringId));

      const req = httpMock.expectOne(`${environment.apiUrl}/projects/${stringId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });

      await expectAsync(promise).toBeResolved();
    });
  });

  describe('updateProject()', () => {
    it('should accept a string id', async () => {
      const stringId = 'f058cb95-dfcb-4e96-9c08-3d56bda6a90d';
      const promise = firstValueFrom(service.updateProject(stringId, { displayOrder: 1 }));

      const req = httpMock.expectOne(`${environment.apiUrl}/projects/${stringId}`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ ...mockPaginatedResponse.data[0], displayOrder: 1 });

      const result = await promise;
      expect(result.displayOrder).toBe(1);
    });
  });
});
