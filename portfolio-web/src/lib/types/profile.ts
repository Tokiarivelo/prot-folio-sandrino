export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
  dribbble?: string;
}

export interface SeoMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface ThemeConfig {
  primaryColor?: string;
  accentColor?: string;
  darkMode?: boolean;
}

export interface Profile {
  id: string;
  fullName: string;
  jobTitle: string;
  heroText: string | null;
  shortBio: string;
  longBio: string | null;
  location: string | null;
  availability: boolean;
  profileImageUrl: string | null;
  resumePdfUrl: string | null;
  socialLinks: SocialLinks | null;
  seoMetadata: SeoMetadata | null;
  themeConfig: ThemeConfig | null;
  createdAt: string;
  updatedAt: string;
}
