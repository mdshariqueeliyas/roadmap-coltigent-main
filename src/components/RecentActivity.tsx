'use client';

import Link from 'next/link';
import type { MasterData } from '@/lib/types';

export function RecentActivity({ data, className = '' }: { data: MasterData; className?: string }) {
  const recent = data.updates.slice(0, 3);

  return (
    <div className={`print-break-inside-avoid rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      <h2 className="mb-4 font-heading text-lg font-semibold text-primary">Recent Activity</h2>
      {recent.length === 0 ? (
        <p className="text-sm text-gray-500">No updates posted yet. Check back next week.</p>
      ) : (
        <ul className="space-y-3">
          {recent.map((u) => (
            <li key={u.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <Link
                href={`/updates/#${u.id}`}
                className="block font-medium text-primary hover:text-secondary"
              >
                {u.type} · {u.date}
              </Link>
              <p className="mt-0.5 text-sm text-gray-600">
                {u.author} — <span className="font-medium">{u.sentiment}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
