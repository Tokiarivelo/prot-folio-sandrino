export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  yearsExperience: number | null;
  iconUrl: string | null;
  order: number;
}

export interface SkillCategory {
  id: string;
  name: string;
  iconUrl: string | null;
  order: number;
  skills: Skill[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  _count: { projectTags: number };
}
