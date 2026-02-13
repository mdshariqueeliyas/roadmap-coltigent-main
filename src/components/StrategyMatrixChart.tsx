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
      <div className="flex h-[450px] items-center justify-center text-gray-500">
        No projects match the current filters.
      </div>
    );
  }

  return (
    <div className="h-[450px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          {/* Quadrant background zones - drawn via reference lines */}
          <ReferenceLine x={50} stroke="#e5e7eb" strokeWidth={1} />
          <ReferenceLine y={50} stroke="#e5e7eb" strokeWidth={1} />
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
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                  <p className="font-semibold text-primary">{p.title}</p>
                  <p className="text-sm text-gray-600">
                    Quadrant: <strong>{p.matrix?.quadrant ?? p.quadrant}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    ROI: {formatROI(p.financials.projected_roi)}
                  </p>
                  <Link
                    href={`/projects/${p.slug}/`}
                    className="mt-2 block text-sm font-medium text-secondary hover:underline"
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
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-green-500" /> Quick Wins
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-blue-500" /> Big Bets
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-slate-400" /> Fillers
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-amber-500" /> Time Sinks
        </span>
      </div>
    </div>
  );
}
