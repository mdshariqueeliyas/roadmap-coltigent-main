'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useData } from '@/context/DataContext';
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
        className="no-print flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4"
      >
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          {crumbs.map((c, i) => (
            <span key={c.href} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-300">/</span>}
              <a href={c.href} className="text-gray-600 hover:text-primary">
                {c.label}
              </a>
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{fiscalLabel}</span>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            <span>Search</span>
            <kbd className="rounded bg-gray-200 px-1.5 py-0.5 text-xs">⌘K</kbd>
          </button>
        </div>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
