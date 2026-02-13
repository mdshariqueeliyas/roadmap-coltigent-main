'use client';

import type { MasterData } from '@/lib/types';

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

const metricConfig = [
  {
    key: 'investment',
    label: 'Total Investment',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    cardClass: 'metric-card-investment',
    iconBg: 'bg-blue-500/10 text-blue-600',
  },
  {
    key: 'roi',
    label: 'ROI Multiplier',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    cardClass: 'metric-card-roi',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    key: 'active',
    label: 'Active Projects',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    cardClass: 'metric-card-active',
    iconBg: 'bg-amber-500/10 text-amber-600',
  },
  {
    key: 'total',
    label: 'Total Projects',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    cardClass: 'metric-card-total',
    iconBg: 'bg-violet-500/10 text-violet-600',
  },
];

export function DashboardMetrics({ data }: { data: MasterData }) {
  const totalInvestment = data.projects.reduce((s, p) => s + p.financials.estimated_cost, 0);
  const totalROI = data.projects.reduce((s, p) => s + p.financials.projected_roi, 0);
  const roiMultiplier = totalInvestment > 0 ? (totalROI / totalInvestment).toFixed(1) : '—';
  const activeCount = data.projects.filter((p) => p.status === 'Active').length;

  const values = [
    formatCurrency(totalInvestment),
    roiMultiplier + 'x',
    String(activeCount),
    String(data.projects.length),
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {metricConfig.map((config, i) => (
        <div
          key={config.key}
          className={`dashboard-card dashboard-card-accent ${config.cardClass}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}>
              {config.icon}
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-800">
              {values[i]}
            </span>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500">{config.label}</p>
        </div>
      ))}
    </div>
  );
}
