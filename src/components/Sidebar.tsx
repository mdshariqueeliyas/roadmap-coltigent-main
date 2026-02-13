'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { useSidebar } from '@/components/LayoutClient';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/matrix/', label: 'Strategy Matrix' },
  { href: '/roadmap/', label: 'Roadmap' },
  { href: '/projects/', label: 'Project Library' },
  { href: '/updates/', label: 'Updates' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data } = useData();
  const { sidebarOpen, closeSidebar } = useSidebar();

  return (
    <aside
      data-role="sidebar"
      className={`no-print fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 ease-out lg:relative lg:translate-x-0 lg:transition-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      aria-label="Site navigation"
    >
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 px-4">
        {data?.config.meta.logo_url ? (
          <img
            src={data.config.meta.logo_url}
            alt=""
            className="h-8 max-w-[140px] object-contain"
            aria-hidden
          />
        ) : null}
        <span className="font-heading text-lg font-semibold text-primary truncate">
          {data?.config.meta.title ?? 'Roadmap'}
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Main navigation">
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
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 ${
                active
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 p-3 text-xs text-gray-600" aria-hidden>
        Roadmap Engine v1.0
      </div>
    </aside>
  );
}
