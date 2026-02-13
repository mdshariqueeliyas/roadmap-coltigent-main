'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/types';

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald-500',
  Complete: 'bg-indigo-500',
  Queued: 'bg-amber-500',
  Backlog: 'bg-slate-400',
  Paused: 'bg-slate-500',
  Overdue: 'bg-rose-500',
};

const MONTH_PX = 24;
const ROW_HEIGHT = 40;

export function RoadmapGantt({
  projects,
  groupBy,
}: {
  projects: Project[];
  groupBy: 'department' | 'status';
}) {
  const { groups, minDate, maxDate, todayX, chartWidth, monthLabels } = useMemo(() => {
    const key = groupBy;
    const map = new Map<string, Project[]>();
    for (const p of projects) {
      const k = p[key] as string;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    }
    const groups = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    let min = new Date(
      Math.min(...projects.map((p) => new Date(p.dates.planned_start).getTime()))
    );
    let max = new Date(
      Math.max(...projects.map((p) => new Date(p.dates.planned_end).getTime()))
    );
    min = new Date(min.getFullYear(), min.getMonth(), 1);
    max = new Date(max.getFullYear(), max.getMonth() + 2, 0);
    const totalMonths =
      (max.getFullYear() - min.getFullYear()) * 12 + (max.getMonth() - min.getMonth()) + 1;
    const chartWidth = Math.max(totalMonths * MONTH_PX, 600);
    const monthLabels: string[] = [];
    let d = new Date(min);
    while (d <= max) {
      monthLabels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      d.setMonth(d.getMonth() + 1);
    }
    const today = new Date();
    const todayX =
      today >= min && today <= max
        ? ((today.getTime() - min.getTime()) / (max.getTime() - min.getTime())) * chartWidth
        : -1;
    return { groups, minDate: min, maxDate: max, todayX, chartWidth, monthLabels };
  }, [projects, groupBy]);

  const leftLabelWidth = 200;

  return (
    <div className="min-w-0">
      <div className="flex" style={{ width: leftLabelWidth + chartWidth }}>
        <div className="shrink-0 pr-2" style={{ width: leftLabelWidth }}>
          <div className="h-8 text-xs font-semibold text-slate-600">Group / Project</div>
        </div>
        <div className="relative shrink-0 overflow-x-auto" style={{ width: chartWidth }}>
          <div className="flex gap-0 text-xs font-semibold text-slate-600">
            {monthLabels.map((m, i) => (
              <div
                key={`${m}-${i}`}
                style={{ width: MONTH_PX }}
                className="shrink-0 text-center"
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      </div>
      {groups.map(([groupName, groupProjects]) => (
        <div key={groupName} className="border-t border-slate-200 first:border-t-0">
          <div
            className="flex items-stretch font-medium text-primary"
            style={{ minHeight: ROW_HEIGHT }}
          >
            <div
              className="flex shrink-0 items-center pr-2 text-sm"
              style={{ width: leftLabelWidth }}
            >
              {groupName}
            </div>
            <div
              className="relative shrink-0 overflow-hidden"
              style={{ width: chartWidth, height: groupProjects.length * ROW_HEIGHT }}
            >
              {todayX >= 0 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                  style={{ left: todayX }}
                  title="Today"
                />
              )}
              {groupProjects.map((p, i) => {
                const start = new Date(p.dates.planned_start);
                const end = new Date(p.dates.planned_end);
                const left =
                  ((start.getTime() - minDate.getTime()) /
                    (maxDate.getTime() - minDate.getTime())) *
                  chartWidth;
                const width =
                  ((end.getTime() - start.getTime()) /
                    (maxDate.getTime() - minDate.getTime())) *
                  chartWidth;
                const color = STATUS_COLORS[p.status] ?? 'bg-gray-400';
                return (
                  <div
                    key={p.id}
                    className="absolute flex items-center"
                    style={{
                      top: i * ROW_HEIGHT,
                      left,
                      width: Math.max(width, 20),
                      height: ROW_HEIGHT - 4,
                    }}
                  >
                    <Link
                      href={`/projects/${p.slug}/`}
                      className={`flex h-full flex-1 items-center rounded-lg px-2 text-xs font-semibold text-white shadow-sm ${color} hover:opacity-95 transition-opacity`}
                      title={`${p.title} (${p.dates.planned_start} – ${p.dates.planned_end})`}
                    >
                      <span className="truncate">{p.title}</span>
                    </Link>
                    <span
                      className="ml-0.5 text-rose-500"
                      title="Milestone"
                      aria-hidden
                    >
                      ◆
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
