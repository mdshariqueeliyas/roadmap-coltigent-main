'use client';

import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { StrategyMatrixChart } from '@/components/StrategyMatrixChart';
import { Skeleton } from '@/components/Skeleton';
import type { Project } from '@/lib/types';

export default function MatrixPage() {
  const { data, loading } = useData();
  const [departments, setDepartments] = useState<string[]>([]);
  const [phases, setPhases] = useState<string[]>([]);

  const departmentsList = useMemo(
    () => Array.from(new Set(data?.projects?.map((p) => p.department) ?? [])).sort(),
    [data?.projects]
  );
  const phasesList = useMemo(
    () => Array.from(new Set(data?.projects?.map((p) => p.phase) ?? [])).sort(),
    [data?.projects]
  );

  const filteredProjects = useMemo(() => {
    if (!data?.projects?.length) return [];
    let list: Project[] = data.projects;
    if (departments.length) {
      list = list.filter((p) => departments.includes(p.department));
    }
    if (phases.length) {
      list = list.filter((p) => phases.includes(p.phase));
    }
    return list.filter((p) => p.matrix != null);
  }, [data?.projects, departments, phases]);

  const toggleDepartment = (d: string) => {
    setDepartments((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };
  const togglePhase = (p: string) => {
    setPhases((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-800">Strategy Matrix</h1>
        <div className="h-[520px] rounded-2xl border border-slate-200 bg-white p-6">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data?.config.modules?.enable_matrix) {
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-6 text-amber-800">
        Strategy Matrix is disabled for this tenant.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-800">Strategy Matrix</h1>
        <p className="mt-2 text-slate-600">
          Impact vs. Effort. Quadrants: <strong className="text-emerald-700">Quick Wins</strong> (high impact, low effort), <strong className="text-blue-700">Big Bets</strong> (high impact, high effort), <strong className="text-slate-600">Fillers</strong> (low both), <strong className="text-amber-700">Time Sinks</strong> (low impact, high effort).
        </p>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <aside className="dashboard-card w-full shrink-0 space-y-6 lg:w-64">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-slate-500">Departments</h2>
          <ul className="space-y-2" role="list">
            {departmentsList.map((d) => (
              <li key={d}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 transition-colors has-[:checked]:text-indigo-700">
                  <input
                    type="checkbox"
                    checked={departments.length === 0 || departments.includes(d)}
                    onChange={() => toggleDepartment(d)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    aria-label={`Filter by department: ${d}`}
                  />
                  {d}
                </label>
              </li>
            ))}
          </ul>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-slate-500 pt-2 border-t border-slate-100">Phases</h2>
          <ul className="space-y-2" role="list">
            {phasesList.map((p) => (
              <li key={p}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 transition-colors has-[:checked]:text-indigo-700">
                  <input
                    type="checkbox"
                    checked={phases.length === 0 || phases.includes(p)}
                    onChange={() => togglePhase(p)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    aria-label={`Filter by phase: ${p}`}
                  />
                  {p}
                </label>
              </li>
            ))}
          </ul>
        </aside>
        <div className="min-w-0 flex-1 dashboard-card">
          <StrategyMatrixChart projects={filteredProjects} />
        </div>
      </div>
    </div>
  );
}
