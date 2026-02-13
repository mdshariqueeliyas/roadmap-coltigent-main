'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { Skeleton } from '@/components/Skeleton';
import type { Project } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

const statusStyles: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Complete: 'bg-blue-100 text-blue-800 border-blue-200',
  Queued: 'bg-amber-100 text-amber-800 border-amber-200',
  Backlog: 'bg-slate-100 text-slate-700 border-slate-200',
  Paused: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function ProjectDetailClient() {
  const params = useParams();
  const slug = params?.slug as string;
  const { data, loading } = useData();

  const project = useMemo(
    () => data?.projects?.find((p) => p.slug === slug),
    [data?.projects, slug]
  );

  const relatedProjects = useMemo((): Project[] => {
    if (!project?.related_projects?.length || !data?.projects) return [];
    return project.related_projects
      .map((id) => data.projects!.find((p) => p.id === id))
      .filter((p): p is Project => p != null);
  }, [project, data?.projects]);

  const updatesForProject = useMemo(
    () =>
      data?.updates?.filter((u) =>
        u.highlight_projects?.includes(project?.id ?? '')
      ) ?? [],
    [data?.updates, project?.id]
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-9 w-3/4 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-52 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-6 text-amber-800">
        <p>Project not found.</p>
        <Link href="/projects/" className="mt-3 inline-block font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
          ← Back to Project Library
        </Link>
      </div>
    );
  }

  const statusStyle = statusStyles[project.status] ?? 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-800">{project.title}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {project.id} · {project.department} · {project.phase}
          </p>
        </div>
        <span className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${statusStyle}`}>
          {project.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6 print-expand-tabs">
          <div>
            <h2 className="mb-3 font-heading text-lg font-semibold text-slate-800">Overview</h2>
            <div className="dashboard-card prose prose-sm max-w-none">
              <ReactMarkdown>{project.body}</ReactMarkdown>
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-heading text-lg font-semibold text-slate-800">Plan</h2>
            <div className="dashboard-card prose prose-sm max-w-none">
              <ReactMarkdown>{project.body}</ReactMarkdown>
            </div>
          </div>

          {updatesForProject.length > 0 && (
            <div>
              <h2 className="mb-3 font-heading text-lg font-semibold text-slate-800">Updates</h2>
              <ul className="space-y-4">
                {updatesForProject.map((u) => (
                  <li key={u.id} className="dashboard-card">
                    <p className="font-semibold text-slate-800">
                      {u.type} · {u.date} — {u.sentiment}
                    </p>
                    <p className="text-sm text-slate-500">{u.author}</p>
                    <div className="mt-3 prose prose-sm max-w-none">
                      <ReactMarkdown>{`${u.body.slice(0, 300)}...`}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-6 no-print">
          <div className="dashboard-card">
            <h3 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-slate-500">The Numbers</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between rounded-lg bg-slate-50/80 px-3 py-2">
                <dt className="text-slate-600">Estimated cost</dt>
                <dd className="font-semibold text-slate-800">{formatCurrency(project.financials.estimated_cost)}</dd>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50/80 px-3 py-2">
                <dt className="text-slate-600">Projected ROI</dt>
                <dd className="font-semibold text-slate-800">{formatCurrency(project.financials.projected_roi)}</dd>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50/80 px-3 py-2">
                <dt className="text-slate-600">Planned start</dt>
                <dd className="font-semibold text-slate-800">{project.dates.planned_start}</dd>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50/80 px-3 py-2">
                <dt className="text-slate-600">Planned end</dt>
                <dd className="font-semibold text-slate-800">{project.dates.planned_end}</dd>
              </div>
              {project.matrix && (
                <div className="flex justify-between rounded-lg bg-indigo-50/80 px-3 py-2">
                  <dt className="text-indigo-700">Quadrant</dt>
                  <dd className="font-semibold text-indigo-800">{project.matrix.quadrant}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="dashboard-card">
            <h3 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-slate-500">Team</h3>
            <p className="text-sm font-medium text-slate-700">{project.owner}</p>
            {project.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {relatedProjects.length > 0 && (
            <div className="dashboard-card">
              <h3 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-slate-500">Dependencies</h3>
              <ul className="space-y-2">
                {relatedProjects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/projects/${p.slug}/`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {p.title} ({p.id})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Print One-Pager
          </button>
        </aside>
      </div>
    </div>
  );
}
