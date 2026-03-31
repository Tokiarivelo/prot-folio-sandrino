export interface ProjectMedia {
  id: string;
  fileUrl: string;
  fileType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  isCover: boolean;
  caption: string | null;
  order: number;
}

export interface ProjectLink {
  id: string;
  label: string;
  url: string;
  type: string;
}

export interface ProjectTag {
  tag: { id: string; name: string; slug: string };
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  displayOrder: number;
  media: ProjectMedia[];
  links: ProjectLink[];
  projectTags: ProjectTag[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProjects {
  data: Project[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
