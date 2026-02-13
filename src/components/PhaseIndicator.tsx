'use client';

import type { MasterData } from '@/lib/types';

export function PhaseIndicator({ data }: { data: MasterData }) {
  const phases = data.config.governance?.phases ?? ['Foundation', 'Acceleration', 'Scale'];
  const activeByPhase = phases.map((phase) => ({
    phase,
    count: data.projects.filter((p) => p.phase === phase && (p.status === 'Active' || p.status === 'Queued')).length,
  }));
  const total = activeByPhase.reduce((s, x) => s + x.count, 0);
  const maxCount = Math.max(1, ...activeByPhase.map((x) => x.count));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-heading text-lg font-semibold text-primary">Strategic Phase</h2>
      <p className="mb-4 text-sm text-gray-600">
        Currently in Phase 1: <strong>{phases[0]}</strong>. Projects by phase.
      </p>
      <div className="flex gap-2">
        {activeByPhase.map(({ phase, count }) => (
          <div key={phase} className="flex-1">
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium text-gray-700">{phase}</span>
              <span className="text-gray-500">{count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-secondary transition-all"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
