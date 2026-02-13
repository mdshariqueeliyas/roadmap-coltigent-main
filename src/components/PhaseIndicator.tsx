'use client';

import type { MasterData } from '@/lib/types';

const phaseColors = [
  { bg: 'bg-indigo-500', light: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-violet-500', light: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-fuchsia-500', light: 'bg-fuchsia-100', text: 'text-fuchsia-700' },
];

export function PhaseIndicator({ data }: { data: MasterData }) {
  const phases = data.config.governance?.phases ?? ['Foundation', 'Acceleration', 'Scale'];
  const activeByPhase = phases.map((phase, i) => ({
    phase,
    count: data.projects.filter((p) => p.phase === phase && (p.status === 'Active' || p.status === 'Queued')).length,
    color: phaseColors[i] ?? phaseColors[0],
  }));
  const total = activeByPhase.reduce((s, x) => s + x.count, 0);
  const maxCount = Math.max(1, ...activeByPhase.map((x) => x.count));

  return (
    <div className="dashboard-card">
      <div className="mb-1 flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="font-heading text-lg font-semibold text-slate-800">Strategic Phase</h2>
      </div>
      <p className="mb-5 text-sm text-slate-600">
        Currently in Phase 1: <strong className="text-slate-800">{phases[0]}</strong>. Projects by phase.
      </p>
      <div className="space-y-4">
        {activeByPhase.map(({ phase, count, color }) => (
          <div key={phase}>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className={`font-semibold ${color.text}`}>{phase}</span>
              <span className="font-medium text-slate-600">{count} projects</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${color.bg} transition-all duration-500`}
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
