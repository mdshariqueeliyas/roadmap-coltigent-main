'use client';

import Link from 'next/link';
import { useData } from '@/context/DataContext';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from '@/components/Skeleton';

const sentimentStyles: Record<string, string> = {
  'On Track': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'At Risk': 'bg-amber-100 text-amber-800 border-amber-200',
  'Behind': 'bg-rose-100 text-rose-800 border-rose-200',
};

export default function UpdatesPage() {
  const { data, loading } = useData();

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-800">Updates</h1>
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const updates = data?.updates ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-800">Updates</h1>
        <p className="mt-1 text-slate-600">Recent status and progress updates</p>
      </div>
      {updates.length === 0 ? (
        <div className="dashboard-card py-12 text-center">
          <p className="text-slate-500 font-medium">No updates posted yet. Check back next week.</p>
        </div>
      ) : (
        <ul className="space-y-6">
          {updates.map((u) => (
            <li key={u.id} id={u.id} className="dashboard-card">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-heading text-lg font-semibold text-slate-800">
                  {u.type} · {u.date}
                </h2>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${sentimentStyles[u.sentiment] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  {u.sentiment}
                </span>
              </div>
              <p className="text-sm text-slate-600">{u.author}</p>
              {u.highlight_projects?.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  Highlights: {u.highlight_projects.join(', ')}
                </p>
              )}
              <div className="mt-4 prose prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 rounded-xl bg-slate-50/50 p-4">
                <ReactMarkdown>{u.body}</ReactMarkdown>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
