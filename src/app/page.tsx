'use client';

import { useData } from '@/context/DataContext';
import { MetricCardSkeleton } from '@/components/Skeleton';
import { DashboardMetrics } from '@/components/DashboardMetrics';
import { PhaseIndicator } from '@/components/PhaseIndicator';
import { VelocityChart } from '@/components/VelocityChart';
import { RecentActivity } from '@/components/RecentActivity';

export default function DashboardPage() {
  const { data, loading } = useData();

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-800">Executive Dashboard</h1>
          <p className="mt-1 text-slate-600">Overview of your strategic roadmap</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="dashboard-card">
            <div className="mb-4 h-4 w-32 animate-skeleton rounded-lg bg-slate-200" />
            <div className="h-48 animate-skeleton rounded-xl bg-slate-100" />
          </div>
          <div className="dashboard-card lg:col-span-2">
            <div className="mb-4 h-4 w-40 animate-skeleton rounded-lg bg-slate-200" />
            <div className="h-48 animate-skeleton rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-6 text-amber-800">
        <p>Unable to load roadmap data. Ensure <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-sm">master_data.json</code> is available (run <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-sm">npm run governance</code> then build).</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-800">Executive Dashboard</h1>
        <p className="mt-1 text-slate-600">Overview of your strategic roadmap and key metrics</p>
      </div>
      <DashboardMetrics data={data} />
      <PhaseIndicator data={data} />
      <div className="grid gap-6 lg:grid-cols-3">
        <VelocityChart data={data} />
        <RecentActivity data={data} className="lg:col-span-2" />
      </div>
    </div>
  );
}
