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
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-primary">Roadmap</h1>
        <div className="h-96 rounded-xl border border-gray-200 bg-white p-6">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (!data?.config.modules?.enable_gantt) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Roadmap (Gantt) is disabled for this tenant.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-primary">Roadmap</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Group by</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as 'department' | 'status')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            aria-label="Group roadmap by"
          >
            <option value="department">Department</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 print-break-inside-avoid">
        <RoadmapGantt projects={projects} groupBy={groupBy} />
      </div>
    </div>
  );
}
