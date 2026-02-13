import type { Metadata } from 'next';
import { Inter, Roboto } from 'next/font/google';
import './globals.css';
import { DataProvider } from '@/context/DataContext';
import { DesignTokensInjector } from '@/components/DesignTokensInjector';
import { LayoutClient } from '@/components/LayoutClient';
import { getConfig } from '@/lib/config';

const inter = Inter({ subsets: ['latin'], variable: '--font-heading' });
const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ['latin'], variable: '--font-body' });

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();
  const title = config?.meta?.title ?? 'Roadmap Engine';
  const description = 'Enterprise-Grade Multi-Tenant Roadmap Platform';
  const faviconUrl = config?.meta?.favicon_url;
  return {
    title,
    description,
    ...(faviconUrl && {
      icons: {
        icon: faviconUrl,
        shortcut: faviconUrl,
        apple: faviconUrl,
      },
    }),
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto.variable}`}>
      <body className="min-h-screen antialiased">
        <DataProvider>
          <DesignTokensInjector />
          <LayoutClient>{children}</LayoutClient>
        </DataProvider>
      </body>
    </html>
  );
}
