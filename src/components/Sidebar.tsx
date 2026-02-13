'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useData } from '@/context/DataContext';

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

  return (
    <aside
      data-role="sidebar"
      className="no-print flex w-64 flex-col border-r border-gray-200 bg-white"
    >
      <div className="flex h-16 items-center border-b border-gray-200 px-4">
        {data?.config.meta.logo_url ? (
          <img
            src={data.config.meta.logo_url}
            alt="Logo"
            className="h-8 max-w-[140px] object-contain"
          />
        ) : (
          <span className="font-heading text-lg font-semibold text-primary">
            {data?.config.meta.title ?? 'Roadmap'}
          </span>
        )}
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
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
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
      <div className="border-t border-gray-200 p-3 text-xs text-gray-500">
        <div>Roadmap Engine v1.0</div>
      </div>
    </aside>
  );
}
