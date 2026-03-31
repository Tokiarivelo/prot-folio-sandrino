import type { SkillLevel } from '@/lib/types/skill';

interface SkillBadgeProps {
  name: string;
  level: SkillLevel;
  yearsExperience?: number | null;
}

const levelConfig: Record<SkillLevel, { label: string; dotColor: string; badgeClass: string }> = {
  BEGINNER: {
    label: 'Beginner',
    dotColor: 'bg-zinc-400',
    badgeClass: 'bg-zinc-800/60 border-zinc-700/50 text-zinc-300',
  },
  INTERMEDIATE: {
    label: 'Intermediate',
    dotColor: 'bg-blue-400',
    badgeClass: 'bg-blue-950/40 border-blue-800/40 text-blue-200',
  },
  ADVANCED: {
    label: 'Advanced',
    dotColor: 'bg-purple-400',
    badgeClass: 'bg-purple-950/40 border-purple-800/40 text-purple-200',
  },
  EXPERT: {
    label: 'Expert',
    dotColor: 'bg-indigo-400',
    badgeClass: 'bg-indigo-950/50 border-indigo-700/50 text-indigo-200',
  },
};

export default function SkillBadge({ name, level, yearsExperience }: SkillBadgeProps) {
  const config = levelConfig[level];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-200 hover:scale-105 ${config.badgeClass}`}
      title={`${config.label}${yearsExperience ? ` · ${yearsExperience}yr${yearsExperience > 1 ? 's' : ''}` : ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dotColor}`} aria-hidden="true" />
      <span>{name}</span>
      {yearsExperience != null && (
        <span className="text-xs opacity-60">{yearsExperience}y</span>
      )}
    </div>
  );
}
