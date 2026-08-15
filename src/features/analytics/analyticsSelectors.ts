import { COLUMN_ORDER, COLUMN_TITLES } from "../../store/boardStore";
import type { ColumnId, Priority, Task } from "../../types";

export interface StatusDistributionSlice {
  columnId: ColumnId;
  name: string;
  value: number;
}

export function getStatusDistribution(tasks: Record<number, Task>): StatusDistributionSlice[] {
  const counts: Record<ColumnId, number> = { backlog: 0, "in-progress": 0, review: 0, done: 0 };
  for (const task of Object.values(tasks)) counts[task.columnId] += 1;
  return COLUMN_ORDER.map((columnId) => ({ columnId, name: COLUMN_TITLES[columnId], value: counts[columnId] }));
}

export interface PriorityBreakdownRow {
  column: string;
  low: number;
  medium: number;
  high: number;
}

export function getPriorityBreakdown(tasks: Record<number, Task>): PriorityBreakdownRow[] {
  const rows: Record<ColumnId, PriorityBreakdownRow> = {
    backlog: { column: COLUMN_TITLES.backlog, low: 0, medium: 0, high: 0 },
    "in-progress": { column: COLUMN_TITLES["in-progress"], low: 0, medium: 0, high: 0 },
    review: { column: COLUMN_TITLES.review, low: 0, medium: 0, high: 0 },
    done: { column: COLUMN_TITLES.done, low: 0, medium: 0, high: 0 },
  };
  for (const task of Object.values(tasks)) rows[task.columnId][task.priority] += 1;
  return COLUMN_ORDER.map((columnId) => rows[columnId]);
}

function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNum}`;
}

export interface SprintVelocityPoint {
  sprint: string;
  completed: number;
  total: number;
}

export function getSprintVelocity(tasks: Record<number, Task>): SprintVelocityPoint[] {
  const buckets = new Map<string, { key: string; sortDate: number; completed: number; total: number }>();

  for (const task of Object.values(tasks)) {
    const key = isoWeekKey(new Date(task.dueDate));
    if (!buckets.has(key)) {
      buckets.set(key, { key, sortDate: new Date(task.dueDate).getTime(), completed: 0, total: 0 });
    }
    const bucket = buckets.get(key)!;
    bucket.total += 1;
    if (task.columnId === "done") bucket.completed += 1;
  }

  return Array.from(buckets.values())
    .sort((a, b) => a.sortDate - b.sortDate)
    .map((bucket, index) => ({ sprint: `Sprint ${index + 1}`, completed: bucket.completed, total: bucket.total }));
}

export interface CompletionTrendPoint {
  date: string;
  cumulative: number;
}

export function getCompletionTrend(tasks: Record<number, Task>): CompletionTrendPoint[] {
  const dayTotals = new Map<string, number>();

  for (const task of Object.values(tasks)) {
    if (!task.completedAt) continue;
    const dayKey = task.completedAt.slice(0, 10);
    dayTotals.set(dayKey, (dayTotals.get(dayKey) ?? 0) + 1);
  }

  const sortedDays = Array.from(dayTotals.keys()).sort();
  let cumulative = 0;
  return sortedDays.map((day) => {
    cumulative += dayTotals.get(day)!;
    return {
      date: new Date(day).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      cumulative,
    };
  });
}

export const PRIORITY_ORDER: Priority[] = ["low", "medium", "high"];
