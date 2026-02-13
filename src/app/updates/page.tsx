'use client';

import Link from 'next/link';
import { useData } from '@/context/DataContext';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from '@/components/Skeleton';

export default function UpdatesPage() {
  const { data, loading } = useData();

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-primary">Updates</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const updates = data?.updates ?? [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-primary">Updates</h1>
      {updates.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
          No updates posted yet. Check back next week.
        </p>
      ) : (
        <ul className="space-y-6">
          {updates.map((u) => (
            <li key={u.id} id={u.id} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading text-lg font-semibold text-primary">
                  {u.type} · {u.date}
                </h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.sentiment === 'On Track'
                      ? 'bg-green-100 text-green-800'
                      : u.sentiment === 'At Risk'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {u.sentiment}
                </span>
              </div>
              <p className="text-sm text-gray-600">{u.author}</p>
              {u.highlight_projects?.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Highlights: {u.highlight_projects.join(', ')}
                </p>
              )}
              <div className="mt-4 prose prose-sm max-w-none">
                <ReactMarkdown>{u.body}</ReactMarkdown>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
