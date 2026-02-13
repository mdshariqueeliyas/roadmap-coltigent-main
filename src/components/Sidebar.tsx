'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { useSidebar } from '@/components/LayoutClient';

const navItems: { href: string; label: string; icon: React.ReactNode }[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: '/matrix/',
    label: 'Strategy Matrix',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/roadmap/',
    label: 'Roadmap',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: '/projects/',
    label: 'Project Library',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: '/updates/',
    label: 'Updates',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data } = useData();
  const { sidebarOpen, closeSidebar } = useSidebar();

  return (
    <aside
      data-role="sidebar"
      className={`no-print fixed inset-y-0 left-0 z-50 flex w-72 flex-col transition-transform duration-200 ease-out lg:relative lg:translate-x-0 lg:transition-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      style={{
        background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 45%, #3730a3 100%)',
        boxShadow: '4px 0 24px -4px rgba(0,0,0,0.12)',
      }}
      aria-label="Site navigation"
    >
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-indigo-400/20 px-5 py-4">
        {data?.config.meta.logo_url ? (
          <img
            src={data.config.meta.logo_url}
            alt=""
            className="h-9 max-w-[150px] object-contain rounded-lg"
            aria-hidden
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        )}
        <span className="font-heading text-lg font-bold text-white truncate">
          {data?.config.meta.title ?? 'Roadmap'}
        </span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Main navigation">
        {navItems.map((item) => {
          const isMatrix = item.href === '/matrix/';
          const isGantt = item.href === '/roadmap/';
          const isBlog = item.href === '/updates/';
          const enabled =
            (!isMatrix || data?.config.modules?.enable_matrix) &&
            (!isGantt || data?.config.modules?.enable_gantt) &&
            (!isBlog || data?.config.modules?.enable_blog);
          if (!enabled) return null;
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-900 ${
                active
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-indigo-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-indigo-400/20 p-4">
        <div className="rounded-xl bg-white/5 px-4 py-2.5 text-xs font-medium text-indigo-200">
          Roadmap Engine v1.0
        </div>
      </div>
    </aside>
  );
}
