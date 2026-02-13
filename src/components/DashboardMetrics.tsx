'use client';

import type { MasterData } from '@/lib/types';

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function DashboardMetrics({ data }: { data: MasterData }) {
  const totalInvestment = data.projects.reduce((s, p) => s + p.financials.estimated_cost, 0);
  const totalROI = data.projects.reduce((s, p) => s + p.financials.projected_roi, 0);
  const roiMultiplier = totalInvestment > 0 ? (totalROI / totalInvestment).toFixed(1) : '—';
  const activeCount = data.projects.filter((p) => p.status === 'Active').length;

  const cards = [
    { label: 'Total Investment', value: formatCurrency(totalInvestment) },
    { label: 'ROI Multiplier', value: roiMultiplier + 'x' },
    { label: 'Active Projects', value: String(activeCount) },
    { label: 'Total Projects', value: String(data.projects.length) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="print-break-inside-avoid rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="text-sm font-medium text-gray-500">{c.label}</p>
          <p className="mt-1 text-2xl font-bold text-primary">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
