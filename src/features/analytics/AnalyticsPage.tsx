import { useMemo, type ReactNode } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { useBoardStore } from "../../store/boardStore";
import { useThemeStore } from "../../store/themeStore";
import { useEnsureBoardLoaded } from "../board/useEnsureBoardLoaded";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  getCompletionTrend,
  getPriorityBreakdown,
  getSprintVelocity,
  getStatusDistribution,
} from "./analyticsSelectors";

// Categorical/ordinal data colors are theme-independent — they encode data identity,
// not surface chrome, so they stay constant across light/dark.
const STATUS_COLORS: Record<string, string> = {
  backlog: "#2a78d6",
  "in-progress": "#eb6834",
  review: "#1baf7a",
  done: "#eda100",
};
const PRIORITY_COLORS = { low: "#86b6ef", medium: "#2a78d6", high: "#104281" };
const ACCENT = "#2a78d6";

// Chart chrome (gridlines, axis text, tooltip, bar separators) mirrors the design
// tokens per theme, since Recharts needs literal color strings rather than Tailwind classes.
const CHART_CHROME = {
  light: {
    gridline: "#e1e3e4",
    axisText: "#464554",
    tooltipBorder: "#c7c4d7",
    tooltipBg: "#ffffff",
    tooltipText: "#191c1d",
    barSeparator: "#ffffff",
    cursorFill: "rgba(0,0,0,0.03)",
    contextGray: "#c7c4d7",
  },
  dark: {
    gridline: "#464554",
    axisText: "#c7c4d7",
    tooltipBorder: "#464554",
    tooltipBg: "#1f1f27",
    tooltipText: "#e4e1ed",
    barSeparator: "#13131b",
    cursorFill: "rgba(255,255,255,0.06)",
    contextGray: "#908fa0",
  },
} as const;

const SHORT_COLUMN_LABEL: Record<string, string> = {
  Backlog: "Backlog",
  "In Progress": "In Prog.",
  Review: "Review",
  Done: "Done",
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-md rounded-lg border border-outline-variant bg-surface-bright p-lg shadow-subtle">
      <div>
        <h2 className="text-headline-sm text-on-surface">{title}</h2>
        <p className="text-body-sm text-on-surface-variant">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function ChartLegend({ items }: { items: { label: string; color: string; value?: number }[] }) {
  return (
    <ul className="flex flex-wrap gap-md" aria-hidden="true">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-xs text-body-sm text-on-surface-variant">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
          {item.value !== undefined && <span className="font-semibold text-on-surface">({item.value})</span>}
        </li>
      ))}
    </ul>
  );
}

export default function AnalyticsPage() {
  const tasks = useBoardStore((s) => s.tasks);
  const hasLoaded = useBoardStore((s) => s.hasLoaded);
  const theme = useThemeStore((s) => s.theme);
  const { isLoading } = useEnsureBoardLoaded();

  const chrome = CHART_CHROME[theme];
  const tooltipContentStyle = {
    borderRadius: 8,
    border: `1px solid ${chrome.tooltipBorder}`,
    backgroundColor: chrome.tooltipBg,
    color: chrome.tooltipText,
    fontSize: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  };

  const statusDistribution = useMemo(() => getStatusDistribution(tasks), [tasks]);
  const priorityBreakdown = useMemo(() => getPriorityBreakdown(tasks), [tasks]);
  const sprintVelocity = useMemo(() => getSprintVelocity(tasks), [tasks]);
  const completionTrend = useMemo(() => getCompletionTrend(tasks), [tasks]);

  const statusRow = useMemo(
    () =>
      statusDistribution.reduce<Record<string, number | string>>(
        (row, slice) => ({ ...row, [slice.columnId]: slice.value, name: "Tasks" }),
        {}
      ),
    [statusDistribution]
  );

  if (isLoading && !hasLoaded) {
    return (
      <div className="flex flex-col gap-lg">
        <div>
          <h1 className="text-headline-md text-on-surface">Analytics</h1>
          <p className="text-body-md text-on-surface-variant">
            Velocity, status distribution, priority breakdown, completion trend.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-lg lg:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[320px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="text-headline-md text-on-surface">Analytics</h1>
        <p className="text-body-md text-on-surface-variant">
          Velocity, status distribution, priority breakdown, completion trend — all derived live from the sprint
          board.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-lg lg:grid-cols-2">
        <ChartCard title="Task status" subtitle="Distribution of all tasks across board columns">
          <ChartLegend
            items={statusDistribution.map((slice) => ({
              label: slice.name,
              color: STATUS_COLORS[slice.columnId],
              value: slice.value,
            }))}
          />
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={[statusRow]} layout="vertical" margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip contentStyle={tooltipContentStyle} />
              {(["backlog", "in-progress", "review", "done"] as const).map((columnId) => (
                <Bar
                  key={columnId}
                  dataKey={columnId}
                  stackId="status"
                  fill={STATUS_COLORS[columnId]}
                  stroke={chrome.barSeparator}
                  strokeWidth={2}
                  barSize={40}
                  isAnimationActive
                  animationDuration={600}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Priority breakdown" subtitle="Task priorities within each column">
          <ChartLegend
            items={[
              { label: "Low", color: PRIORITY_COLORS.low },
              { label: "Medium", color: PRIORITY_COLORS.medium },
              { label: "High", color: PRIORITY_COLORS.high },
            ]}
          />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={priorityBreakdown} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid stroke={chrome.gridline} strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="column"
                tickFormatter={(value: string) => SHORT_COLUMN_LABEL[value] ?? value}
                tick={{ fill: chrome.axisText, fontSize: 11 }}
                axisLine={{ stroke: chrome.gridline }}
                tickLine={false}
              />
              <YAxis allowDecimals={false} tick={{ fill: chrome.axisText, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipContentStyle} cursor={{ fill: chrome.cursorFill }} />
              <Bar
                dataKey="low"
                stackId="priority"
                fill={PRIORITY_COLORS.low}
                stroke={chrome.barSeparator}
                strokeWidth={2}
                barSize={24}
                animationDuration={600}
              />
              <Bar
                dataKey="medium"
                stackId="priority"
                fill={PRIORITY_COLORS.medium}
                stroke={chrome.barSeparator}
                strokeWidth={2}
                barSize={24}
                animationDuration={600}
              />
              <Bar
                dataKey="high"
                stackId="priority"
                fill={PRIORITY_COLORS.high}
                stroke={chrome.barSeparator}
                strokeWidth={2}
                barSize={24}
                radius={[4, 4, 0, 0]}
                animationDuration={600}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sprint velocity" subtitle="Completed vs. total tasks due, grouped by weekly sprint">
          <ChartLegend
            items={[
              { label: "Completed", color: ACCENT },
              { label: "Total due", color: chrome.contextGray },
            ]}
          />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sprintVelocity} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid stroke={chrome.gridline} strokeDasharray="0" vertical={false} />
              <XAxis dataKey="sprint" tick={{ fill: chrome.axisText, fontSize: 11 }} axisLine={{ stroke: chrome.gridline }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: chrome.axisText, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipContentStyle} cursor={{ fill: chrome.cursorFill }} />
              <Bar dataKey="total" fill={chrome.contextGray} radius={[4, 4, 0, 0]} barSize={20} animationDuration={600} />
              <Bar dataKey="completed" fill={ACCENT} radius={[4, 4, 0, 0]} barSize={20} animationDuration={600} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Completion trend" subtitle="Cumulative completed tasks over time">
          {completionTrend.length === 0 ? (
            <p className="flex h-[260px] items-center justify-center text-body-sm text-on-surface-variant">
              No tasks completed yet — move a card to Done to see the trend.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={completionTrend} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="completionFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.1} />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chrome.gridline} strokeDasharray="0" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: chrome.axisText, fontSize: 11 }} axisLine={{ stroke: chrome.gridline }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: chrome.axisText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipContentStyle} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke={ACCENT}
                  strokeWidth={2}
                  fill="url(#completionFill)"
                  dot={{ r: 4, fill: ACCENT, stroke: chrome.barSeparator, strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
