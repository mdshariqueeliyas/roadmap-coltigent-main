'use client';

import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import Link from 'next/link';
import { Skeleton } from '@/components/Skeleton';
import type { Project } from '@/lib/types';

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function ProjectsPage() {
  const { data, loading } = useData();
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [ownerFilter, setOwnerFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [deptFilter, setDeptFilter] = useState<string[]>([]);
  const [costMin, setCostMin] = useState<number | ''>('');
  const [costMax, setCostMax] = useState<number | ''>('');

  const owners = useMemo(
    () => Array.from(new Set(data?.projects?.map((p) => p.owner) ?? [])).sort(),
    [data?.projects]
  );
  const statuses = useMemo(
    () => Array.from(new Set(data?.projects?.map((p) => p.status) ?? [])).sort(),
    [data?.projects]
  );
  const departments = useMemo(
    () => Array.from(new Set(data?.projects?.map((p) => p.department) ?? [])).sort(),
    [data?.projects]
  );

  const filtered = useMemo(() => {
    if (!data?.projects?.length) return [];
    let list = data.projects;
    if (ownerFilter.length)
      list = list.filter((p) => ownerFilter.includes(p.owner));
    if (statusFilter.length)
      list = list.filter((p) => statusFilter.includes(p.status));
    if (deptFilter.length)
      list = list.filter((p) => deptFilter.includes(p.department));
    if (costMin !== '')
      list = list.filter((p) => p.financials.estimated_cost >= costMin);
    if (costMax !== '')
      list = list.filter((p) => p.financials.estimated_cost <= costMax);
    return list;
  }, [data?.projects, ownerFilter, statusFilter, deptFilter, costMin, costMax]);

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-primary">Project Library</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-primary">Project Library</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              view === 'grid' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => setView('table')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              view === 'table' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      <aside className="flex flex-wrap gap-6 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <p className="mb-2 text-xs font-semibold text-gray-500">Owner</p>
          <div className="flex flex-wrap gap-2">
            {owners.slice(0, 6).map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={ownerFilter.length === 0 || ownerFilter.includes(o)}
                  onChange={() => toggle(setOwnerFilter, o)}
                />
                {o.split(' ')[0]}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold text-gray-500">Status</p>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={statusFilter.length === 0 || statusFilter.includes(s)}
                  onChange={() => toggle(setStatusFilter, s)}
                />
                {s}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold text-gray-500">Department</p>
          <div className="flex flex-wrap gap-2">
            {departments.map((d) => (
              <label key={d} className="flex cursor-pointer items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={deptFilter.length === 0 || deptFilter.includes(d)}
                  onChange={() => toggle(setDeptFilter, d)}
                />
                {d}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold text-gray-500">Cost range</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={costMin}
              onChange={(e) => setCostMin(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-24 rounded border border-gray-200 px-2 py-1 text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={costMax}
              onChange={(e) => setCostMax(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-24 rounded border border-gray-200 px-2 py-1 text-sm"
            />
          </div>
        </div>
      </aside>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
          No projects found matching the current filters.
        </p>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="p-3 text-left font-semibold text-primary">Title</th>
                <th className="p-3 text-left font-semibold text-primary">ID</th>
                <th className="p-3 text-left font-semibold text-primary">Status</th>
                <th className="p-3 text-left font-semibold text-primary">Owner</th>
                <th className="p-3 text-right font-semibold text-primary">Cost</th>
                <th className="p-3 text-right font-semibold text-primary">ROI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <Link
                      href={`/projects/${p.slug}/`}
                      className="font-medium text-secondary hover:underline"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-600">{p.id}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{p.owner}</td>
                  <td className="p-3 text-right text-gray-600">{formatCurrency(p.financials.estimated_cost)}</td>
                  <td className="p-3 text-right text-gray-600">{formatCurrency(p.financials.projected_roi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}/`}
      className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-heading font-semibold text-primary">{project.title}</h3>
        <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {project.id}
        </span>
      </div>
      <div className="mb-2 flex flex-wrap gap-1">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
          {project.status}
        </span>
        {project.matrix?.quadrant && (
          <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs text-secondary">
            {project.matrix.quadrant}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500">{project.owner}</p>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-secondary"
          style={{ width: `${(project.scores.confidence ?? 0) * 100}%` }}
          title="Progress / confidence"
        />
      </div>
    </Link>
  );
}
