'use client';

import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { RoadmapGantt } from '@/components/RoadmapGantt';
import { Skeleton } from '@/components/Skeleton';

export default function RoadmapPage() {
  const { data, loading } = useData();
  const [groupBy, setGroupBy] = useState<'department' | 'status'>('department');

  const projects = useMemo(() => data?.projects ?? [], [data?.projects]);

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-800">Roadmap</h1>
        <div className="h-96 rounded-2xl border border-slate-200 bg-white p-6">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data?.config.modules?.enable_gantt) {
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-6 text-amber-800">
        Roadmap (Gantt) is disabled for this tenant.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-800">Roadmap</h1>
          <p className="mt-1 text-slate-600">Timeline view by department or status</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">Group by</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as 'department' | 'status')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
            aria-label="Group roadmap by"
          >
            <option value="department">Department</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card print-break-inside-avoid">
        <RoadmapGantt projects={projects} groupBy={groupBy} />
      </div>
    </div>
  );
}
