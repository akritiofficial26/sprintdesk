import { useMemo } from "react";
import { CheckCircle2, Clock3, Gauge, ListTodo, TrendingUp } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useBoardStore, COLUMN_ORDER, COLUMN_TITLES } from "../../store/boardStore";
import { useEnsureBoardLoaded } from "../board/useEnsureBoardLoaded";
import { DataTable, type DataTableColumn } from "../../components/ui/DataTable";
import type { Task } from "../../types";

const PRIORITY_BADGE: Record<Task["priority"], string> = {
  low: "bg-secondary-container text-on-secondary-container",
  medium: "bg-warning-container text-warning",
  high: "bg-error-container text-on-error-container",
};

const PRIORITY_RANK: Record<Task["priority"], number> = { low: 0, medium: 1, high: 2 };

/**
 * Declared at module scope, not inside the component: the array identity is a
 * dependency of DataTable's internal sort memo, so rebuilding it every render
 * would invalidate that memo on every render.
 */
const TASK_COLUMNS: DataTableColumn<Task>[] = [
  {
    key: "title",
    header: "Task",
    sortValue: (task) => task.title.toLowerCase(),
    render: (task) => <span className="font-medium">{task.title}</span>,
  },
  {
    key: "columnId",
    header: "Status",
    sortValue: (task) => COLUMN_ORDER.indexOf(task.columnId),
    render: (task) => COLUMN_TITLES[task.columnId],
  },
  {
    key: "priority",
    header: "Priority",
    sortValue: (task) => PRIORITY_RANK[task.priority],
    render: (task) => (
      <span
        className={`rounded px-sm py-[2px] text-label-md uppercase tracking-wide ${PRIORITY_BADGE[task.priority]}`}
      >
        {task.priority}
      </span>
    ),
  },
  { key: "assignee", header: "Assignee", sortValue: (task) => task.assignee },
  {
    key: "dueDate",
    header: "Due",
    sortValue: (task) => task.dueDate,
    render: (task) =>
      new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const tasks = useBoardStore((s) => s.tasks);
  const { isLoading } = useEnsureBoardLoaded();

  const dashboard = useMemo(() => {
    const statusCounts = { backlog: 0, "in-progress": 0, review: 0, done: 0 };

    for (const task of Object.values(tasks)) {
      statusCounts[task.columnId] += 1;
    }

    const total = Object.keys(tasks).length;
    const done = statusCounts.done;
    const inProgress = statusCounts["in-progress"];
    const review = statusCounts.review;
    const completionRate = total ? Math.round((done / total) * 100) : 0;

    const statusBreakdown = COLUMN_ORDER.map((columnId) => ({
      columnId,
      label: COLUMN_TITLES[columnId],
      count: statusCounts[columnId],
      value: total ? Math.round((statusCounts[columnId] / total) * 100) : 0,
    }));

    const allTasks = Object.values(tasks);

    const upcomingTasks = allTasks
      .slice()
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);

    return {
      total,
      done,
      inProgress,
      review,
      completionRate,
      statusBreakdown,
      upcomingTasks,
      allTasks,
    };
  }, [tasks]);

  const {
    total,
    done,
    inProgress,
    review,
    completionRate,
    statusBreakdown,
    upcomingTasks,
    allTasks,
  } = dashboard;

  const summaryCards = [
    { label: "Total", value: total, detail: "All tasks", icon: ListTodo, tone: "bg-primary/10 text-primary" },
    { label: "In progress", value: inProgress, detail: `${Math.max(0, Math.round((inProgress / Math.max(total, 1)) * 100))}% active`, icon: Clock3, tone: "bg-warning-container text-warning" },
    { label: "Completed", value: done, detail: `${completionRate}% done`, icon: CheckCircle2, tone: "bg-success-container text-success" },
    { label: "Review", value: review, detail: "Queued", icon: Gauge, tone: "bg-secondary-container text-on-secondary-container" },
  ];

  return (
    <div className="space-y-lg">
      <header className="rounded-2xl border border-outline-variant bg-surface-container-low p-lg">
        <div className="flex items-center justify-between gap-md">
          <div>
            <p className="text-label-md uppercase tracking-[0.16em] text-on-surface-variant">Overview</p>
            <h1 className="mt-sm text-headline-md text-on-surface">
              Welcome{user ? `, ${user.firstName}` : ""}
            </h1>
          </div>

          <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface px-md py-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-body-sm text-on-surface-variant">Sprint health</p>
              <p className="text-headline-sm text-on-surface">{completionRate}%</p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-md md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value, detail, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-outline-variant bg-surface-container-low p-lg">
            <div className="flex items-start justify-between gap-md">
              <div>
                <p className="text-body-sm text-on-surface-variant">{label}</p>
                <p className="mt-sm text-headline-md text-on-surface">{value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="mt-md text-body-sm text-on-surface-variant">{detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-lg xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-2xl border border-outline-variant bg-surface-container-low p-lg">
          <div className="mb-lg flex items-center justify-between gap-md">
            <div>
              <p className="text-label-md uppercase tracking-[0.16em] text-on-surface-variant">Pipeline</p>
              <h2 className="mt-sm text-headline-sm text-on-surface">Sprint distribution</h2>
            </div>
            <span className="rounded-full bg-primary/10 px-sm py-[2px] text-label-md uppercase tracking-wide text-primary">
              {completionRate}%
            </span>
          </div>

          <div className="space-y-md">
            {statusBreakdown.map(({ columnId, label, count, value }) => (
              <div key={columnId} className="space-y-xs">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-on-surface">{label}</span>
                  <span className="text-on-surface-variant">{count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-surface-container">
                  <div
                    className={`h-full rounded-full ${
                      columnId === "backlog"
                        ? "bg-outline"
                        : columnId === "in-progress"
                          ? "bg-primary"
                          : columnId === "review"
                            ? "bg-secondary"
                            : "bg-success"
                    }`}
                    style={{ width: `${Math.max(value, count > 0 ? 12 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-outline-variant bg-surface-container-low p-lg">
          <div className="mb-lg">
            <p className="text-label-md uppercase tracking-[0.16em] text-on-surface-variant">Next up</p>
            <h2 className="mt-sm text-headline-sm text-on-surface">Upcoming work</h2>
          </div>

          <div className="space-y-md">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-outline-variant bg-surface p-md">
                  <p className="truncate text-body-md font-medium text-on-surface">{task.title}</p>
                  <div className="mt-xs flex items-center justify-between gap-md text-body-sm text-on-surface-variant">
                    <span>{task.assignee}</span>
                    <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-outline-variant p-md text-body-sm text-on-surface-variant">
                No upcoming tasks.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-lg">
        <div className="mb-lg flex flex-wrap items-end justify-between gap-md">
          <div>
            <p className="text-label-md uppercase tracking-[0.16em] text-on-surface-variant">
              All work
            </p>
            <h2 className="mt-sm text-headline-sm text-on-surface">Sprint tasks</h2>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Sort by any column header — the same board data as{" "}
            <span className="text-on-surface">/board</span> and{" "}
            <span className="text-on-surface">/analytics</span>.
          </p>
        </div>

        <DataTable
          columns={TASK_COLUMNS}
          data={allTasks}
          getRowId={(task) => task.id}
          caption="All sprint tasks, sortable by task, status, priority, assignee, and due date"
          isLoading={isLoading && total === 0}
          emptyMessage="No sprint tasks yet."
        />
      </section>
    </div>
  );
}
