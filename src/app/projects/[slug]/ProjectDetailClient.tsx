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
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p>Project not found.</p>
        <Link href="/projects/" className="mt-2 inline-block text-secondary hover:underline">
          ← Back to Project Library
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">{project.title}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {project.id} · {project.department} · {project.phase}
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
          {project.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6 print-expand-tabs">
          <div>
            <h2 className="mb-2 font-heading text-lg font-semibold text-primary">Overview</h2>
            <div className="prose prose-sm max-w-none rounded-xl border border-gray-200 bg-white p-4">
              <ReactMarkdown>{project.body}</ReactMarkdown>
            </div>
          </div>

          <div>
            <h2 className="mb-2 font-heading text-lg font-semibold text-primary">Plan</h2>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{project.body}</ReactMarkdown>
              </div>
            </div>
          </div>

          {updatesForProject.length > 0 && (
            <div>
              <h2 className="mb-2 font-heading text-lg font-semibold text-primary">Updates</h2>
              <ul className="space-y-3">
                {updatesForProject.map((u) => (
                  <li key={u.id} className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-sm font-medium text-primary">
                      {u.type} · {u.date} — {u.sentiment}
                    </p>
                    <p className="text-xs text-gray-500">{u.author}</p>
                    <div className="mt-2 prose prose-sm max-w-none">
                      <ReactMarkdown>{`${u.body.slice(0, 300)}...`}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-6 no-print">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 font-heading text-sm font-semibold text-primary">The Numbers</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Estimated cost</dt>
                <dd className="font-medium">{formatCurrency(project.financials.estimated_cost)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Projected ROI</dt>
                <dd className="font-medium">{formatCurrency(project.financials.projected_roi)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Planned start</dt>
                <dd className="font-medium">{project.dates.planned_start}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Planned end</dt>
                <dd className="font-medium">{project.dates.planned_end}</dd>
              </div>
              {project.matrix && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Quadrant</dt>
                  <dd className="font-medium">{project.matrix.quadrant}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 font-heading text-sm font-semibold text-primary">Team</h3>
            <p className="text-sm text-gray-700">{project.owner}</p>
            {project.tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {relatedProjects.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold text-primary">Dependencies</h3>
              <ul className="space-y-1">
                {relatedProjects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/projects/${p.slug}/`}
                      className="text-sm text-secondary hover:underline"
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
            className="w-full rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Print One-Pager
          </button>
        </aside>
      </div>
    </div>
  );
}
