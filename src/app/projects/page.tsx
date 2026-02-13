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

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Complete: 'bg-blue-100 text-blue-800 border-blue-200',
  Queued: 'bg-amber-100 text-amber-800 border-amber-200',
  Backlog: 'bg-slate-100 text-slate-700 border-slate-200',
  Paused: 'bg-slate-100 text-slate-600 border-slate-200',
};

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
      <div className="space-y-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-800">Project Library</h1>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-800">Project Library</h1>
          <p className="mt-1 text-slate-600">Browse and filter all projects</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white p-1 shadow-card border border-slate-200/80">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              view === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => setView('table')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              view === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      <aside className="dashboard-card flex flex-wrap gap-8">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Owner</p>
          <div className="flex flex-wrap gap-2">
            {owners.slice(0, 6).map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 transition-colors has-[:checked]:border-indigo-300 has-[:checked]:bg-indigo-50">
                <input type="checkbox" checked={ownerFilter.length === 0 || ownerFilter.includes(o)} onChange={() => toggle(setOwnerFilter, o)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                {o.split(' ')[0]}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</p>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 transition-colors has-[:checked]:border-indigo-300 has-[:checked]:bg-indigo-50">
                <input type="checkbox" checked={statusFilter.length === 0 || statusFilter.includes(s)} onChange={() => toggle(setStatusFilter, s)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                {s}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Department</p>
          <div className="flex flex-wrap gap-2">
            {departments.map((d) => (
              <label key={d} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 transition-colors has-[:checked]:border-indigo-300 has-[:checked]:bg-indigo-50">
                <input type="checkbox" checked={deptFilter.length === 0 || deptFilter.includes(d)} onChange={() => toggle(setDeptFilter, d)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                {d}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Cost range</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={costMin}
              onChange={(e) => setCostMin(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-28 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
            />
            <input
              type="number"
              placeholder="Max"
              value={costMax}
              onChange={(e) => setCostMax(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-28 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </aside>

      {filtered.length === 0 ? (
        <div className="dashboard-card py-12 text-center">
          <p className="text-slate-500 font-medium">No projects found matching the current filters.</p>
          <p className="mt-1 text-sm text-slate-400">Try adjusting filters or clear some to see more results.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50/30">
                <th className="p-4 text-left font-semibold text-slate-800">Title</th>
                <th className="p-4 text-left font-semibold text-slate-800">ID</th>
                <th className="p-4 text-left font-semibold text-slate-800">Status</th>
                <th className="p-4 text-left font-semibold text-slate-800">Owner</th>
                <th className="p-4 text-right font-semibold text-slate-800">Cost</th>
                <th className="p-4 text-right font-semibold text-slate-800">ROI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={`border-b border-slate-100 hover:bg-indigo-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                  <td className="p-4">
                    <Link href={`/projects/${p.slug}/`} className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
                      {p.title}
                    </Link>
                  </td>
                  <td className="p-4 font-mono text-slate-600">{p.id}</td>
                  <td className="p-4">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[p.status] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{p.owner}</td>
                  <td className="p-4 text-right font-medium text-slate-700">{formatCurrency(p.financials.estimated_cost)}</td>
                  <td className="p-4 text-right font-medium text-slate-700">{formatCurrency(p.financials.projected_roi)}</td>
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
  const statusStyle = statusColors[project.status] ?? 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <Link
      href={`/projects/${project.slug}/`}
      className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-indigo-200"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-heading font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2">{project.title}</h3>
        <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-xs font-mono font-medium text-slate-600">
          {project.id}
        </span>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle}`}>
          {project.status}
        </span>
        {project.matrix?.quadrant && (
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {project.matrix.quadrant}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500">{project.owner}</p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
          style={{ width: `${(project.scores.confidence ?? 0) * 100}%` }}
          title="Progress / confidence"
        />
      </div>
    </Link>
  );
}
