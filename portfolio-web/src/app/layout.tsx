import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getProfile } from '@/lib/api/profile';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();

  const title = profile?.seoMetadata?.title ?? profile?.fullName ?? 'Portfolio';
  const description =
    profile?.seoMetadata?.description ??
    profile?.shortBio ??
    'Personal portfolio website';
  const keywords = profile?.seoMetadata?.keywords ?? [];
  const ogImage = profile?.seoMetadata?.ogImage ?? profile?.profileImageUrl ?? undefined;

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: profile ? [{ name: profile.fullName }] : undefined,
    openGraph: {
      type: 'website',
      title,
      description,
      images: ogImage ? [{ url: ogImage, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#0d0d0d',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="bg-[#0d0d0d] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
