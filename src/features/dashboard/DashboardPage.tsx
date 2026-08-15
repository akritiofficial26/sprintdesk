import { useMemo } from "react";
import { useAuthStore } from "../../store/authStore";
import { useBoardStore, COLUMN_TITLES } from "../../store/boardStore";
import { useEnsureBoardLoaded } from "../board/useEnsureBoardLoaded";
import { DataTable, type DataTableColumn } from "../../components/ui/DataTable";
import type { Task } from "../../types";

const PRIORITY_RANK: Record<Task["priority"], number> = { low: 0, medium: 1, high: 2 };

const PRIORITY_BADGE: Record<Task["priority"], string> = {
  low: "bg-secondary-container text-on-secondary-container",
  medium: "bg-warning-container text-warning",
  high: "bg-error-container text-on-error-container",
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const tasks = useBoardStore((s) => s.tasks);
  const { isLoading } = useEnsureBoardLoaded();

  const rows = useMemo(() => Object.values(tasks), [tasks]);

  const columns: DataTableColumn<Task>[] = useMemo(
    () => [
      { key: "title", header: "Title", sortValue: (task) => task.title.toLowerCase() },
      {
        key: "columnId",
        header: "Status",
        sortValue: (task) => task.columnId,
        render: (task) => COLUMN_TITLES[task.columnId],
      },
      {
        key: "priority",
        header: "Priority",
        sortValue: (task) => PRIORITY_RANK[task.priority],
        render: (task) => (
          <span className={`rounded px-sm py-[2px] text-label-md uppercase tracking-wide ${PRIORITY_BADGE[task.priority]}`}>
            {task.priority}
          </span>
        ),
      },
      { key: "assignee", header: "Assignee", sortValue: (task) => task.assignee.toLowerCase() },
      {
        key: "dueDate",
        header: "Due date",
        sortValue: (task) => task.dueDate,
        render: (task) => new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="text-headline-md text-on-surface">Welcome{user ? `, ${user.firstName}` : ""}</h1>
        <p className="text-body-md text-on-surface-variant">Every sprint task, at a glance.</p>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(task) => task.id}
        caption="All sprint tasks across every board column"
        isLoading={isLoading}
        emptyMessage="No tasks yet — add one from the sprint board."
      />
    </div>
  );
}
