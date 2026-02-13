'use client';

import Link from 'next/link';
import type { MasterData } from '@/lib/types';

const sentimentStyles: Record<string, string> = {
  'On Track': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'At Risk': 'bg-amber-100 text-amber-800 border-amber-200',
  'Behind': 'bg-rose-100 text-rose-800 border-rose-200',
};

export function RecentActivity({ data, className = '' }: { data: MasterData; className?: string }) {
  const recent = data.updates.slice(0, 3);

  return (
    <div className={`dashboard-card ${className}`}>
      <div className="mb-1 flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h2 className="font-heading text-lg font-semibold text-slate-800">Recent Activity</h2>
      </div>
      {recent.length === 0 ? (
        <p className="rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-500">
          No updates posted yet. Check back next week.
        </p>
      ) : (
        <ul className="space-y-0">
          {recent.map((u, i) => (
            <li
              key={u.id}
              className="group border-b border-slate-100 last:border-0 py-4 first:pt-0 last:pb-0"
            >
              <Link
                href={`/updates/#${u.id}`}
                className="block rounded-xl p-3 -mx-3 transition-colors hover:bg-slate-50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {u.type} · {u.date}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${sentimentStyles[u.sentiment] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}
                  >
                    {u.sentiment}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {u.author} — <span className="font-medium text-slate-700">{u.sentiment}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
