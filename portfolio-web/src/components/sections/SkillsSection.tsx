import { motion } from 'framer-motion';
import SectionWrapper from '@/components/ui/SectionWrapper';
import SkillBadge from '@/components/ui/SkillBadge';
import type { SkillCategory } from '@/lib/types/skill';

interface SkillsSectionProps {
  skillCategories: SkillCategory[];
}

// This component uses framer-motion animations but renders categories server-side
// The motion animation is handled via client wrapper
function SkillCategoryCard({ category, categoryIndex }: { category: SkillCategory; categoryIndex: number }) {
  const sortedSkills = [...category.skills].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-[#141414] border border-[#27272a] rounded-2xl p-6 hover:border-indigo-500/20 transition-all duration-300">
      {/* Category header */}
      <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
        {category.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.iconUrl}
            alt=""
            width={20}
            height={20}
            className="w-5 h-5 object-contain"
            aria-hidden="true"
          />
        ) : (
          <span
            className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0"
            aria-hidden="true"
          />
        )}
        {category.name}
        <span className="ml-auto text-xs text-zinc-600 font-normal">
          {sortedSkills.length} skill{sortedSkills.length !== 1 ? 's' : ''}
        </span>
      </h3>

      {/* Skills */}
      <div className="flex flex-wrap gap-2">
        {sortedSkills.map((skill, skillIndex) => (
          <div
            key={skill.id}
            style={{
              animationDelay: `${(categoryIndex * 0.1) + (skillIndex * 0.04)}s`,
            }}
            className="animate-fade-in"
          >
            <SkillBadge
              name={skill.name}
              level={skill.level}
              yearsExperience={skill.yearsExperience}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SkillsSection({ skillCategories }: SkillsSectionProps) {
  if (skillCategories.length === 0) {
    return null;
  }

  const sortedCategories = [...skillCategories].sort((a, b) => a.order - b.order);

  return (
    <section
      id="skills"
      className="py-24 bg-[#111111]"
      aria-label="Skills"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionWrapper className="text-center mb-12">
          <span className="text-sm font-medium text-indigo-400 tracking-widest uppercase">
            Expertise
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            Skills & Technologies
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            Technologies and tools I work with, grouped by domain.
          </p>
        </SectionWrapper>

        {/* Legend */}
        <SectionWrapper delay={0.1} className="flex flex-wrap items-center justify-center gap-4 mb-10 text-xs text-zinc-500">
          {[
            { level: 'BEGINNER', color: 'bg-zinc-400', label: 'Beginner' },
            { level: 'INTERMEDIATE', color: 'bg-blue-400', label: 'Intermediate' },
            { level: 'ADVANCED', color: 'bg-purple-400', label: 'Advanced' },
            { level: 'EXPERT', color: 'bg-indigo-400', label: 'Expert' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${color}`} aria-hidden="true" />
              <span>{label}</span>
            </div>
          ))}
        </SectionWrapper>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedCategories.map((category, index) => (
            <SectionWrapper key={category.id} delay={index * 0.08}>
              <SkillCategoryCard category={category} categoryIndex={index} />
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
