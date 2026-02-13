'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { useSidebar } from '@/components/LayoutClient';
import { SearchModal } from './SearchModal';

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  if (pathname === '/' || pathname === '') return [{ label: 'Dashboard', href: '/' }];
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let acc = '';
  const labels: Record<string, string> = {
    matrix: 'Strategy Matrix',
    roadmap: 'Roadmap',
    projects: 'Project Library',
    updates: 'Updates',
  };
  for (const seg of segments) {
    acc += `/${seg}`;
    const label = labels[seg] ?? seg.replace(/-/g, ' ');
    crumbs.push({ label: label.charAt(0).toUpperCase() + label.slice(1), href: acc + '/' });
  }
  return crumbs;
}

function getFiscalWeek(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  return `FY ${date.getFullYear()} W${week}`;
}

export function TopBar() {
  const pathname = usePathname();
  const { data } = useData();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [searchOpen, setSearchOpen] = useState(false);
  const [fiscalLabel, setFiscalLabel] = useState('');

  useEffect(() => {
    const d = new Date();
    setFiscalLabel(getFiscalWeek(d));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const crumbs = getBreadcrumbs(pathname);

  return (
    <>
      <header
        data-role="topbar"
        className="no-print flex h-14 shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-4"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={toggleSidebar}
            className="lg:hidden -ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-2 text-sm">
            {crumbs.map((c, i) => (
              <span key={c.href} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-300" aria-hidden>/</span>}
                <a href={c.href} className="text-gray-700 hover:text-primary focus-visible:underline focus-visible:outline-none">
                  {c.label}
                </a>
              </span>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <span className="hidden text-sm text-gray-600 sm:inline" aria-hidden>{fiscalLabel}</span>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            aria-label="Open search (⌘K)"
          >
            <span className="hidden sm:inline">Search</span>
            <kbd className="rounded bg-gray-200 px-1.5 py-0.5 text-xs" aria-hidden>⌘K</kbd>
          </button>
        </div>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
