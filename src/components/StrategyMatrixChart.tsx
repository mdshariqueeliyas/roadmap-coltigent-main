'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { Project } from '@/lib/types';

const QUADRANT_COLORS: Record<string, string> = {
  'Quick Wins': '#22c55e',
  'Big Bets': '#2563eb',
  Fillers: '#94a3b8',
  'Time Sinks': '#f59e0b',
};

function formatROI(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function StrategyMatrixChart({ projects }: { projects: Project[] }) {
  const data = useMemo(
    () =>
      projects.map((p) => ({
        ...p,
        x: p.matrix!.effort_normalized,
        y: p.matrix!.impact_normalized,
        quadrant: p.matrix!.quadrant,
      })),
    [projects]
  );

  if (data.length === 0) {
    return (
      <div className="flex h-[450px] items-center justify-center rounded-xl bg-slate-50 text-slate-600 font-medium">
        No projects match the current filters.
      </div>
    );
  }

  return (
    <div className="h-[450px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          {/* Quadrant background zones - drawn via reference lines */}
          <ReferenceLine x={50} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" />
          <ReferenceLine y={50} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" />
          <XAxis
            type="number"
            dataKey="x"
            name="Effort"
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            label={{ value: 'Effort (Complexity)', position: 'bottom', fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Impact"
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            label={{ value: 'Impact (Strategic Value)', angle: -90, position: 'insideLeft', fontSize: 12 }}
          />
          <ZAxis type="number" dataKey="x" range={[200, 400]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as Project & { quadrant: string };
              return (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-elevated">
                  <p className="font-semibold text-slate-800">{p.title}</p>
                  <p className="text-sm text-slate-600">
                    Quadrant: <strong>{p.matrix?.quadrant ?? p.quadrant}</strong>
                  </p>
                  <p className="text-sm text-slate-600">
                    ROI: {formatROI(p.financials.projected_roi)}
                  </p>
                  <Link
                    href={`/projects/${p.slug}/`}
                    className="mt-2 block text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    View project →
                  </Link>
                </div>
              );
            }}
          />
          <Scatter name="Projects" data={data}>
            {data.map((entry, i) => (
              <Cell key={entry.id} fill={QUADRANT_COLORS[entry.quadrant] ?? '#64748b'} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="mt-5 flex flex-wrap gap-6 text-sm font-medium text-slate-600">
        <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Quick Wins
        </span>
        <span className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Big Bets
        </span>
        <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Fillers
        </span>
        <span className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Time Sinks
        </span>
      </div>
    </div>
  );
}
