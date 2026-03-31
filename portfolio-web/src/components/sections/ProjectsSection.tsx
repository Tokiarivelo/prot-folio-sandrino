'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import ProjectCard from '@/components/ui/ProjectCard';
import type { Project } from '@/lib/types/project';
import type { Tag } from '@/lib/types/skill';

interface ProjectsSectionProps {
  projects: Project[];
  tags: Tag[];
}

const ALL_FILTER = '__all__';

export default function ProjectsSection({ projects, tags }: ProjectsSectionProps) {
  const [activeTag, setActiveTag] = useState<string>(ALL_FILTER);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    let result = projects;

    if (activeTag !== ALL_FILTER) {
      result = result.filter((project) =>
        project.projectTags?.some((pt) => pt.tag.slug === activeTag)
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.shortDescription.toLowerCase().includes(query) ||
          project.projectTags?.some((pt) => pt.tag.name.toLowerCase().includes(query))
      );
    }

    return result;
  }, [projects, activeTag, searchQuery]);

  const usedTagSlugs = useMemo(() => {
    const slugs = new Set<string>();
    projects.forEach((project) => {
      project.projectTags?.forEach((pt) => slugs.add(pt.tag.slug));
    });
    return slugs;
  }, [projects]);

  const visibleTags = tags.filter((tag) => usedTagSlugs.has(tag.slug));

  return (
    <section
      id="projects"
      className="py-24 bg-[#0d0d0d]"
      aria-label="Projects"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-indigo-400 tracking-widest uppercase">
            Work
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            Featured Projects
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            A selection of projects I&apos;ve built, contributed to, or shipped.
          </p>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-4 mb-10"
        >
          {/* Search */}
          <div className="relative max-w-md mx-auto w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-[#27272a] text-white placeholder-zinc-500 rounded-xl text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
              aria-label="Search projects"
            />
          </div>

          {/* Tag Filter Bar */}
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Filter by tag">
              <button
                onClick={() => setActiveTag(ALL_FILTER)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 ${
                  activeTag === ALL_FILTER
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-transparent border-[#27272a] text-zinc-400 hover:text-white hover:border-zinc-600'
                }`}
                aria-pressed={activeTag === ALL_FILTER}
              >
                All
              </button>
              {visibleTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setActiveTag(activeTag === tag.slug ? ALL_FILTER : tag.slug)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 ${
                    activeTag === tag.slug
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-transparent border-[#27272a] text-zinc-400 hover:text-white hover:border-zinc-600'
                  }`}
                  aria-pressed={activeTag === tag.slug}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Project Grid */}
        <AnimatePresence mode="wait">
          {filteredProjects.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#27272a] flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-zinc-600" aria-hidden="true" />
              </div>
              <p className="text-zinc-400 font-medium">No projects found</p>
              <p className="text-zinc-600 text-sm mt-1">
                Try adjusting your filters or search query.
              </p>
              <button
                onClick={() => {
                  setActiveTag(ALL_FILTER);
                  setSearchQuery('');
                }}
                className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project count */}
        {filteredProjects.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-zinc-600 mt-8"
          >
            Showing {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
          </motion.p>
        )}
      </div>
    </section>
  );
}
