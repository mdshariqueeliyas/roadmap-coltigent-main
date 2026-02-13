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
    <div className="dashboard-card">
      <div className="mb-1 flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h2 className="font-heading text-lg font-semibold text-slate-800">Velocity</h2>
      </div>
      <p className="mb-5 text-sm text-slate-600">Projects started and completed by month</p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)',
              }}
              labelStyle={{ fontWeight: 600, color: '#334155' }}
            />
            <Bar dataKey="started" name="Started" radius={[6, 6, 0, 0]} fill="#4f46e5" />
            <Bar dataKey="completed" name="Completed" radius={[6, 6, 0, 0]} fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
