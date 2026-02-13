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
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-primary">Strategy Matrix</h1>
        <div className="h-[500px] rounded-xl border border-gray-200 bg-white p-6">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (!data?.config.modules?.enable_matrix) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Strategy Matrix is disabled for this tenant.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-primary">Strategy Matrix</h1>
      <p className="text-gray-600">
        Impact vs. Effort. Quadrants: Quick Wins (high impact, low effort), Big Bets (high impact, high effort), Fillers (low both), Time Sinks (low impact, high effort).
      </p>
      <div className="flex gap-6">
        <aside className="w-56 shrink-0 space-y-4 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="font-heading text-sm font-semibold text-primary">Departments</h2>
          <ul className="space-y-1">
            {departmentsList.map((d) => (
              <li key={d}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={departments.length === 0 || departments.includes(d)}
                    onChange={() => toggleDepartment(d)}
                  />
                  {d}
                </label>
              </li>
            ))}
          </ul>
          <h2 className="font-heading text-sm font-semibold text-primary">Phases</h2>
          <ul className="space-y-1">
            {phasesList.map((p) => (
              <li key={p}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={phases.length === 0 || phases.includes(p)}
                    onChange={() => togglePhase(p)}
                  />
                  {p}
                </label>
              </li>
            ))}
          </ul>
        </aside>
        <div className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-6">
          <StrategyMatrixChart projects={filteredProjects} />
        </div>
      </div>
    </div>
  );
}
