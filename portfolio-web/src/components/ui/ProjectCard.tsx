import Image from 'next/image';
import Link from 'next/link';
import { Github, ExternalLink, Play } from 'lucide-react';
import type { Project, ProjectMedia } from '@/lib/types/project';

interface ProjectCardProps {
  project: Project;
}

function getCoverImage(media: ProjectMedia[]): ProjectMedia | null {
  if (!media || media.length === 0) return null;
  const cover = media.find((m) => m.isCover && m.fileType === 'IMAGE');
  if (cover) return cover;
  const firstImage = media.find((m) => m.fileType === 'IMAGE');
  return firstImage ?? null;
}

function getLinkIcon(type: string) {
  const normalized = type.toLowerCase();
  if (normalized === 'github' || normalized === 'repository') {
    return <Github className="w-4 h-4" />;
  }
  if (normalized === 'demo' || normalized === 'live' || normalized === 'website') {
    return <ExternalLink className="w-4 h-4" />;
  }
  if (normalized === 'video' || normalized === 'youtube') {
    return <Play className="w-4 h-4" />;
  }
  return <ExternalLink className="w-4 h-4" />;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const coverImage = getCoverImage(project.media);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col bg-[#141414] border border-[#27272a] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-950/30"
    >
      {/* Cover Image */}
      <div className="relative w-full aspect-video bg-[#1a1a1a] overflow-hidden flex-shrink-0">
        {coverImage ? (
          <Image
            src={coverImage.fileUrl}
            alt={coverImage.caption ?? project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950/30 to-zinc-900">
            <span className="text-4xl font-bold text-zinc-700 select-none">
              {project.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Title */}
        <h3 className="text-base font-semibold text-white leading-snug group-hover:text-indigo-300 transition-colors duration-200 line-clamp-2">
          {project.title}
        </h3>

        {/* Short Description */}
        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3 flex-1">
          {project.shortDescription}
        </p>

        {/* Tags */}
        {project.projectTags && project.projectTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.projectTags.slice(0, 4).map(({ tag }) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 text-xs rounded-full bg-zinc-800/80 border border-zinc-700/50 text-zinc-300"
              >
                {tag.name}
              </span>
            ))}
            {project.projectTags.length > 4 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-800/80 border border-zinc-700/50 text-zinc-500">
                +{project.projectTags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Links */}
        {project.links && project.links.length > 0 && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#27272a]">
            {project.links.slice(0, 3).map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-indigo-400 rounded-lg hover:bg-indigo-950/30 transition-all duration-200"
                aria-label={link.label}
              >
                {getLinkIcon(link.type)}
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
