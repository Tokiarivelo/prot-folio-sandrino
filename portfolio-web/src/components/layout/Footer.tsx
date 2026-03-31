import { Github, Linkedin, Twitter, Mail, Dribbble } from 'lucide-react';
import type { SocialLinks } from '@/lib/types/profile';

interface FooterProps {
  fullName: string;
  socialLinks: SocialLinks | null;
}

interface SocialIconLink {
  key: keyof SocialLinks;
  icon: React.ReactNode;
  label: string;
}

const SOCIAL_ICONS: SocialIconLink[] = [
  { key: 'github', icon: <Github className="w-4 h-4" />, label: 'GitHub' },
  { key: 'linkedin', icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn' },
  { key: 'twitter', icon: <Twitter className="w-4 h-4" />, label: 'Twitter' },
  { key: 'email', icon: <Mail className="w-4 h-4" />, label: 'Email' },
  { key: 'dribbble', icon: <Dribbble className="w-4 h-4" />, label: 'Dribbble' },
];

export default function Footer({ fullName, socialLinks }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0d0d0d] border-t border-[#27272a]/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Name / Copyright */}
          <p className="text-sm text-zinc-500">
            &copy; {currentYear}{' '}
            <span className="text-zinc-400 font-medium">{fullName}</span>
            {'. All rights reserved.'}
          </p>

          {/* Social Links */}
          {socialLinks && (
            <div className="flex items-center gap-2" aria-label="Social links">
              {SOCIAL_ICONS.map(({ key, icon, label }) => {
                const href = socialLinks[key];
                if (!href) return null;

                const resolvedHref = key === 'email' && !href.startsWith('mailto:')
                  ? `mailto:${href}`
                  : href;

                return (
                  <a
                    key={key}
                    href={resolvedHref}
                    target={key === 'email' ? undefined : '_blank'}
                    rel={key === 'email' ? undefined : 'noopener noreferrer'}
                    aria-label={label}
                    className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-950/30 rounded-lg transition-all duration-200"
                  >
                    {icon}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
