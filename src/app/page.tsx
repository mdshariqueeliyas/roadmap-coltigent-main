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
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-primary">Executive Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 h-4 w-32 animate-skeleton rounded bg-gray-200" />
            <div className="h-48 animate-skeleton rounded bg-gray-200" />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
            <div className="mb-4 h-4 w-40 animate-skeleton rounded bg-gray-200" />
            <div className="h-48 animate-skeleton rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p>Unable to load roadmap data. Ensure <code className="rounded bg-amber-100 px-1">master_data.json</code> is available (run <code className="rounded bg-amber-100 px-1">npm run governance</code> then build).</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-primary">Executive Dashboard</h1>
      <DashboardMetrics data={data} />
      <PhaseIndicator data={data} />
      <div className="grid gap-6 lg:grid-cols-3">
        <VelocityChart data={data} />
        <RecentActivity data={data} className="lg:col-span-2" />
      </div>
    </div>
  );
}
