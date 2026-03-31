import { getProfile } from '@/lib/api/profile';
import { getProjects } from '@/lib/api/projects';
import { getSkillCategories } from '@/lib/api/skills';
import { getTags } from '@/lib/api/tags';
import { getTools } from '@/lib/api/tools';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import ToolsTickerSection from '@/components/sections/ToolsTickerSection';
import AboutSection from '@/components/sections/AboutSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import SkillsSection from '@/components/sections/SkillsSection';
import ContactSection from '@/components/sections/ContactSection';

export const revalidate = 300;

export default async function HomePage() {
  const [profile, projectsResult, skillCategories, tags, tools] = await Promise.all([
    getProfile(),
    getProjects({ status: 'PUBLISHED', limit: 100 }),
    getSkillCategories(),
    getTags(),
    getTools(),
  ]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-[#27272a] flex items-center justify-center mb-6">
          <span className="text-2xl" aria-hidden="true">🚧</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Portfolio Coming Soon</h1>
        <p className="text-zinc-400 max-w-md">
          This portfolio is currently being set up. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <HeroSection profile={profile} />
        <ToolsTickerSection tools={tools} />
        <AboutSection profile={profile} />
        <ProjectsSection
          projects={projectsResult.data}
          tags={tags}
        />
        <SkillsSection skillCategories={skillCategories} />
        <ContactSection
          socialLinks={profile.socialLinks}
          email={profile.socialLinks?.email}
        />
      </main>
      <Footer
        fullName={profile.fullName}
        socialLinks={profile.socialLinks}
      />
    </>
  );
}
