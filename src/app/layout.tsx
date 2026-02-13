import type { Metadata } from 'next';
import { Inter, Roboto } from 'next/font/google';
import './globals.css';
import { DataProvider } from '@/context/DataContext';
import { DesignTokensInjector } from '@/components/DesignTokensInjector';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

const inter = Inter({ subsets: ['latin'], variable: '--font-heading' });
const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Roadmap Engine',
  description: 'Enterprise-Grade Multi-Tenant Roadmap Platform',
};

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
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col">
              <TopBar />
              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
