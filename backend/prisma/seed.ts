import { PrismaClient, ProjectStatus, SkillLevel } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Admin user
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'Admin@123456',
    10,
  );
  const admin = await prisma.adminUser.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@portfolio.dev' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@portfolio.dev',
      password: hashedPassword,
      fullName: 'Sandrino',
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Profile
  const profile = await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      fullName: 'Sandrino',
      jobTitle: 'Full Stack Developer',
      heroText: "Hi, I'm Sandrino",
      shortBio:
        'I build beautiful, fast, and accessible web experiences. Open to new opportunities.',
      longBio:
        "I'm a passionate full-stack developer with a love for clean code and great user experiences. With experience in both frontend and backend development, I craft end-to-end solutions that are performant, maintainable, and delightful to use. When I'm not coding, you'll find me exploring new technologies, contributing to open source, or hiking in the mountains.",
      location: 'Antananarivo, Madagascar',
      availability: true,
      profileImageUrl: null,
      resumePdfUrl: null,
      socialLinks: {
        github: 'https://github.com/sandrino',
        linkedin: 'https://linkedin.com/in/sandrino',
        twitter: 'https://twitter.com/sandrino',
        email: 'sandrino@portfolio.dev',
      },
      seoMetadata: {
        title: 'Sandrino — Full Stack Developer',
        description:
          'Full Stack Developer specializing in React, Node.js, and modern web technologies.',
        keywords: ['developer', 'full-stack', 'react', 'nodejs', 'portfolio'],
        ogImage: null,
      },
      themeConfig: {
        primaryColor: '#6366f1',
        accentColor: '#8b5cf6',
        darkMode: true,
      },
    },
  });
  console.log(`✅ Profile: ${profile.fullName}`);

  // Skill categories + skills
  const categories = [
    {
      name: 'Frontend',
      order: 1,
      skills: [
        {
          name: 'React',
          level: SkillLevel.EXPERT,
          yearsExperience: 5,
          order: 1,
        },
        {
          name: 'Next.js',
          level: SkillLevel.ADVANCED,
          yearsExperience: 3,
          order: 2,
        },
        {
          name: 'TypeScript',
          level: SkillLevel.EXPERT,
          yearsExperience: 4,
          order: 3,
        },
        {
          name: 'TailwindCSS',
          level: SkillLevel.EXPERT,
          yearsExperience: 3,
          order: 4,
        },
        {
          name: 'Angular',
          level: SkillLevel.ADVANCED,
          yearsExperience: 3,
          order: 5,
        },
      ],
    },
    {
      name: 'Backend',
      order: 2,
      skills: [
        {
          name: 'Node.js',
          level: SkillLevel.EXPERT,
          yearsExperience: 5,
          order: 1,
        },
        {
          name: 'NestJS',
          level: SkillLevel.ADVANCED,
          yearsExperience: 3,
          order: 2,
        },
        {
          name: 'PostgreSQL',
          level: SkillLevel.ADVANCED,
          yearsExperience: 4,
          order: 3,
        },
        {
          name: 'Prisma',
          level: SkillLevel.ADVANCED,
          yearsExperience: 2,
          order: 4,
        },
        {
          name: 'REST APIs',
          level: SkillLevel.EXPERT,
          yearsExperience: 5,
          order: 5,
        },
      ],
    },
    {
      name: 'DevOps & Tools',
      order: 3,
      skills: [
        {
          name: 'Docker',
          level: SkillLevel.INTERMEDIATE,
          yearsExperience: 2,
          order: 1,
        },
        { name: 'Git', level: SkillLevel.EXPERT, yearsExperience: 6, order: 2 },
        {
          name: 'Supabase',
          level: SkillLevel.ADVANCED,
          yearsExperience: 2,
          order: 3,
        },
        {
          name: 'CI/CD',
          level: SkillLevel.INTERMEDIATE,
          yearsExperience: 2,
          order: 4,
        },
      ],
    },
  ];

  for (const cat of categories) {
    const category = await prisma.skillCategory.upsert({
      where: { userId_name: { userId: admin.id, name: cat.name } },
      update: {},
      create: {
        userId: admin.id,
        name: cat.name,
        order: cat.order,
      },
    });

    for (const skill of cat.skills) {
      await prisma.skill.upsert({
        where: {
          id: `seed-skill-${cat.name}-${skill.name}`
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-'),
        },
        update: {},
        create: {
          id: `seed-skill-${cat.name}-${skill.name}`
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-'),
          userId: admin.id,
          categoryId: category.id,
          name: skill.name,
          level: skill.level,
          yearsExperience: skill.yearsExperience,
          order: skill.order,
        },
      });
    }
    console.log(`✅ Category: ${cat.name} (${cat.skills.length} skills)`);
  }

  // Tags
  const tagData = [
    { name: 'React', slug: 'react' },
    { name: 'Next.js', slug: 'nextjs' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: 'NestJS', slug: 'nestjs' },
    { name: 'TailwindCSS', slug: 'tailwindcss' },
    { name: 'PostgreSQL', slug: 'postgresql' },
    { name: 'Angular', slug: 'angular' },
  ];

  const tags: Record<string, string> = {};
  for (const t of tagData) {
    const tag = await prisma.tag.upsert({
      where: { slug: t.slug },
      update: {},
      create: { name: t.name, slug: t.slug },
    });
    tags[t.slug] = tag.id;
  }
  console.log(`✅ Tags: ${tagData.length} tags`);

  // Projects
  const projects = [
    {
      id: 'seed-project-1',
      title: 'E-commerce Platform',
      slug: 'e-commerce-platform',
      shortDescription:
        'A full-featured e-commerce platform with real-time inventory management.',
      fullDescription:
        'Built a scalable e-commerce solution handling thousands of products and concurrent users. Features include real-time inventory updates, Stripe payment integration, order tracking, and an admin dashboard.',
      status: ProjectStatus.PUBLISHED,
      displayOrder: 1,
      tags: ['react', 'nextjs', 'typescript', 'postgresql'],
      links: [
        {
          label: 'GitHub',
          url: 'https://github.com/sandrino/ecommerce',
          type: 'github',
        },
        {
          label: 'Live Demo',
          url: 'https://ecommerce.sandrino.dev',
          type: 'demo',
        },
      ],
    },
    {
      id: 'seed-project-2',
      title: 'Portfolio CMS',
      slug: 'portfolio-cms',
      shortDescription:
        'A headless CMS powering this portfolio with NestJS and Supabase.',
      fullDescription:
        'Designed and built a full headless CMS with a NestJS REST API, Supabase PostgreSQL database, and Supabase Storage for media. Features JWT authentication, Swagger API docs, and a Next.js frontend.',
      status: ProjectStatus.PUBLISHED,
      displayOrder: 2,
      tags: ['nestjs', 'typescript', 'postgresql'],
      links: [
        {
          label: 'GitHub',
          url: 'https://github.com/sandrino/portfolio-cms',
          type: 'github',
        },
      ],
    },
    {
      id: 'seed-project-3',
      title: 'Task Management App',
      slug: 'task-management-app',
      shortDescription:
        'Real-time collaborative task management with drag-and-drop boards.',
      fullDescription:
        'A Kanban-style project management tool with real-time collaboration via WebSockets. Supports teams, custom boards, labels, due dates, and file attachments stored in Supabase Storage.',
      status: ProjectStatus.PUBLISHED,
      displayOrder: 3,
      tags: ['react', 'typescript', 'nodejs', 'tailwindcss'],
      links: [
        {
          label: 'GitHub',
          url: 'https://github.com/sandrino/task-app',
          type: 'github',
        },
        { label: 'Live Demo', url: 'https://tasks.sandrino.dev', type: 'demo' },
      ],
    },
    {
      id: 'seed-project-4',
      title: 'Angular Admin Dashboard',
      slug: 'angular-admin-dashboard',
      shortDescription:
        'A modern admin dashboard built with Angular 20 and Angular Material.',
      fullDescription:
        'A feature-rich admin dashboard with full CRUD operations, data visualization, file uploads, role-based access control, and a responsive layout built with Angular Material and standalone components.',
      status: ProjectStatus.DRAFT,
      displayOrder: 4,
      tags: ['angular', 'typescript'],
      links: [],
    },
  ];

  for (const p of projects) {
    const { tags: projectTags, links, ...projectData } = p;

    const project = await prisma.project.upsert({
      where: { slug: projectData.slug },
      update: {},
      create: {
        ...projectData,
        userId: admin.id,
      },
    });

    // Add tags
    for (const tagSlug of projectTags) {
      const tagId = tags[tagSlug];
      if (tagId) {
        await prisma.projectTag
          .create({
            data: { projectId: project.id, tagId },
          })
          .catch(() => {
            // Skip duplicate
          });
      }
    }

    // Add links
    for (const link of links) {
      await prisma.projectLink
        .create({
          data: { projectId: project.id, ...link },
        })
        .catch(() => {
          // Skip duplicate
        });
    }

    console.log(`✅ Project: ${project.title} (${project.status})`);
  }

  console.log('\n🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
