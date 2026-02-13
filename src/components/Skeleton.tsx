'use client';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-skeleton rounded-xl bg-slate-200 ${className}`}
      aria-hidden
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="dashboard-card">
      <Skeleton className="mb-3 h-4 w-28 rounded-lg" />
      <Skeleton className="h-9 w-36 rounded-lg" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
