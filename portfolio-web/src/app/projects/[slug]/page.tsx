import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Github, ExternalLink, Play, Calendar } from 'lucide-react';
import { getProjectBySlug, getPublishedProjectSlugs } from '@/lib/api/projects';
import { getProfile } from '@/lib/api/profile';
import type { ProjectMedia, ProjectLink } from '@/lib/types/project';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPublishedProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [project, profile] = await Promise.all([
    getProjectBySlug(slug),
    getProfile(),
  ]);

  if (!project) {
    return { title: 'Project Not Found' };
  }

  const coverImage = project.media.find((m) => m.isCover && m.fileType === 'IMAGE')
    ?? project.media.find((m) => m.fileType === 'IMAGE');

  const siteName = profile?.fullName ?? 'Portfolio';

  return {
    title: project.title,
    description: project.shortDescription,
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      siteName,
      images: coverImage ? [{ url: coverImage.fileUrl, alt: project.title }] : undefined,
    },
  };
}

function getLinkIcon(type: string, className = 'w-4 h-4') {
  const normalized = type.toLowerCase();
  if (normalized === 'github' || normalized === 'repository') {
    return <Github className={className} />;
  }
  if (normalized === 'demo' || normalized === 'live' || normalized === 'website') {
    return <ExternalLink className={className} />;
  }
  if (normalized === 'video' || normalized === 'youtube') {
    return <Play className={className} />;
  }
  return <ExternalLink className={className} />;
}

function MediaGallery({ media }: { media: ProjectMedia[] }) {
  const images = media.filter((m) => m.fileType === 'IMAGE');
  if (images.length === 0) return null;

  const cover = images.find((m) => m.isCover) ?? images[0];
  const rest = images.filter((m) => m.id !== cover.id);

  return (
    <div className="flex flex-col gap-4">
      {/* Main cover image */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#1a1a1a]">
        <Image
          src={cover.fileUrl}
          alt={cover.caption ?? 'Project cover'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 900px"
          priority
        />
      </div>

      {/* Additional images */}
      {rest.length > 0 && (
        <div className={`grid gap-4 ${rest.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {rest.map((img) => (
            <div
              key={img.id}
              className="relative aspect-video rounded-xl overflow-hidden bg-[#1a1a1a]"
            >
              <Image
                src={img.fileUrl}
                alt={img.caption ?? 'Project screenshot'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 450px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectLinks({ links }: { links: ProjectLink[] }) {
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] border border-[#27272a] hover:border-indigo-500/60 text-zinc-300 hover:text-white text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 hover:bg-indigo-950/20"
        >
          {getLinkIcon(link.type)}
          {link.label}
        </a>
      ))}
    </div>
  );
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const publishedAt = new Date(project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  const descriptionParagraphs = project.fullDescription
    ? project.fullDescription.split('\n').filter((p) => p.trim().length > 0)
    : [project.shortDescription];

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-[#27272a]/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            Back to projects
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        {/* Header */}
        <header className="mb-10">
          {/* Tags */}
          {project.projectTags && project.projectTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {project.projectTags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-950/40 border border-indigo-800/40 text-indigo-300"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            {project.title}
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed mb-6">
            {project.shortDescription}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 pb-6 border-b border-[#27272a]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <time dateTime={project.createdAt}>{publishedAt}</time>
            </div>
          </div>
        </header>

        {/* Media Gallery */}
        {project.media && project.media.length > 0 && (
          <section aria-label="Project media" className="mb-10">
            <MediaGallery media={project.media} />
          </section>
        )}

        {/* Links */}
        {project.links && project.links.length > 0 && (
          <section aria-label="Project links" className="mb-10">
            <ProjectLinks links={project.links} />
          </section>
        )}

        {/* Full Description */}
        <section aria-label="Project description">
          <div className="prose prose-invert prose-zinc max-w-none">
            {descriptionParagraphs.map((paragraph, index) => (
              <p key={index} className="text-zinc-300 leading-relaxed text-base mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
