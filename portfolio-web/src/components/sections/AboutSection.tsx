import Image from 'next/image';
import { MapPin, Download, User } from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import type { Profile } from '@/lib/types/profile';

interface AboutSectionProps {
  profile: Profile;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function AboutSection({ profile }: AboutSectionProps) {
  const paragraphs = profile.longBio
    ? profile.longBio.split('\n').filter((p) => p.trim().length > 0)
    : [profile.shortBio];

  return (
    <section
      id="about"
      className="py-24 bg-[#111111]"
      aria-label="About me"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionWrapper className="text-center mb-16">
          <span className="text-sm font-medium text-indigo-400 tracking-widest uppercase">
            About
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            Who I Am
          </h2>
        </SectionWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Column */}
          <SectionWrapper direction="left">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              {/* Decorative frame */}
              <div
                className="absolute -inset-4 bg-gradient-to-br from-indigo-600/20 to-purple-700/10 rounded-3xl blur-xl"
                aria-hidden="true"
              />
              <div
                className="absolute -top-2 -right-2 w-full h-full border border-indigo-500/20 rounded-2xl"
                aria-hidden="true"
              />

              <div className="relative rounded-2xl overflow-hidden bg-[#1a1a1a] border border-[#27272a] aspect-square w-full max-w-[380px] mx-auto">
                {profile.profileImageUrl ? (
                  <Image
                    src={profile.profileImageUrl}
                    alt={`${profile.fullName} — ${profile.jobTitle}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, 380px"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/60 to-zinc-900 gap-3">
                    <User className="w-16 h-16 text-zinc-600" aria-hidden="true" />
                    <span className="text-3xl font-bold text-zinc-600 select-none">
                      {getInitials(profile.fullName)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </SectionWrapper>

          {/* Text Column */}
          <SectionWrapper direction="right" delay={0.1}>
            <div className="flex flex-col gap-6">
              {/* Bio paragraphs */}
              <div className="flex flex-col gap-4">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-zinc-400 leading-relaxed text-base sm:text-lg"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Meta info */}
              <div className="flex flex-col gap-3 pt-2">
                {profile.location && (
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile.availability && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-emerald-400 font-medium">Available for new opportunities</span>
                  </div>
                )}
              </div>

              {/* Resume CTA */}
              {profile.resumePdfUrl && (
                <div className="pt-2">
                  <a
                    href={profile.resumePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] border border-[#27272a] hover:border-indigo-500/60 text-zinc-300 hover:text-white text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 hover:bg-white/5"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    Download Resume
                  </a>
                </div>
              )}
            </div>
          </SectionWrapper>
        </div>
      </div>
    </section>
  );
}
