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
        className="no-print flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-sm"
        style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.04)' }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="lg:hidden -ml-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 transition-colors"
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
                {i > 0 && <span className="text-slate-300" aria-hidden>/</span>}
                <a
                  href={c.href}
                  className="font-medium text-slate-600 hover:text-indigo-600 focus-visible:underline focus-visible:outline-none transition-colors rounded px-1.5 py-0.5"
                >
                  {c.label}
                </a>
              </span>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-sm font-medium text-slate-500 sm:inline px-3 py-1.5 rounded-lg bg-slate-100/80" aria-hidden>
            {fiscalLabel}
          </span>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-800 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 transition-all"
            aria-label="Open search (⌘K)"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline">Search</span>
            <kbd className="rounded-lg bg-white border border-slate-200 px-1.5 py-0.5 text-xs font-mono text-slate-500" aria-hidden>⌘K</kbd>
          </button>
        </div>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
