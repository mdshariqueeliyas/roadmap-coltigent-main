'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { MasterData } from '@/lib/types';

export function VelocityChart({ data }: { data: MasterData }) {
  const chartData = useMemo(() => {
    const byMonth: Record<string, { month: string; completed: number; started: number }> = {};
    const months = new Set<string>();
    for (const p of data.projects) {
      const end = p.dates.planned_end.slice(0, 7);
      const start = p.dates.planned_start.slice(0, 7);
      months.add(end);
      months.add(start);
    }
    const sorted = Array.from(months).sort();
    for (const m of sorted) {
      byMonth[m] = {
        month: m,
        completed: data.projects.filter(
          (p) => p.status === 'Complete' && p.dates.planned_end.slice(0, 7) === m
        ).length,
        started: data.projects.filter(
          (p) => p.dates.planned_start.slice(0, 7) === m
        ).length,
      };
    }
    return Object.values(byMonth).slice(-6);
  }, [data.projects]);

  return (
    <div className="print-break-inside-avoid rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-heading text-lg font-semibold text-primary">Velocity</h2>
      <p className="mb-4 text-sm text-gray-600">Projects started and completed by month</p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="started" fill="var(--color-secondary)" name="Started" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" fill="var(--color-accent)" name="Completed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
