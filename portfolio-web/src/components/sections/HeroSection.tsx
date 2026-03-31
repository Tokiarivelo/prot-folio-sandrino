import { ChevronDown, Download, ArrowRight, MapPin } from 'lucide-react';
import type { Profile } from '@/lib/types/profile';

interface HeroSectionProps {
  profile: Profile;
}

export default function HeroSection({ profile }: HeroSectionProps) {
  const displayHeroText = profile.heroText ?? `Hi, I'm ${profile.fullName}`;

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center bg-[#0d0d0d] overflow-hidden"
      aria-label="Hero"
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-700/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Availability badge */}
        {profile.availability && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Available for work
          </div>
        )}

        {/* Hero Text - h1 */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-4">
          {displayHeroText}
        </h1>

        {/* Job Title */}
        <p className="text-xl sm:text-2xl font-medium text-indigo-400 mb-6">
          {profile.jobTitle}
        </p>

        {/* Short Bio */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-4">
          {profile.shortBio}
        </p>

        {/* Location */}
        {profile.location && (
          <div className="flex items-center justify-center gap-1.5 text-sm text-zinc-500 mb-10">
            <MapPin className="w-4 h-4 text-indigo-500" aria-hidden="true" />
            <span>{profile.location}</span>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-indigo-900/40 group"
          >
            View Projects
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>

          {profile.resumePdfUrl && (
            <a
              href={profile.resumePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-transparent border border-[#27272a] hover:border-indigo-500/60 text-zinc-300 hover:text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 hover:bg-white/5"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Download Resume
            </a>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-600">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5 animate-bounce" aria-hidden="true" />
      </div>
    </section>
  );
}
