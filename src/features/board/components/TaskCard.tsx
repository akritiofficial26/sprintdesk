import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../../types";

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  low: "bg-secondary-container text-on-secondary-container",
  medium: "bg-warning-container text-warning",
  high: "bg-error-container text-on-error-container",
};

interface TaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
}

export function TaskCard({ task, onOpen }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const dueDate = new Date(task.dueDate);
  const isOverdue = task.columnId !== "done" && dueDate < new Date(new Date().toDateString());

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-sm rounded-lg border border-outline-variant bg-surface-bright p-md shadow-subtle transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-sm">
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder "${task.title}"`}
          className="mt-[2px] shrink-0 cursor-grab touch-none text-outline transition-colors hover:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:cursor-grabbing"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            drag_indicator
          </span>
        </button>

        <button
          onClick={() => onOpen(task)}
          className="flex-1 text-left text-body-md font-medium text-on-surface transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {task.title}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-sm pl-[26px]">
        <span
          className={`rounded px-sm py-[2px] text-label-md uppercase tracking-wide ${PRIORITY_STYLES[task.priority]}`}
        >
          {task.priority}
        </span>
        {task.comments.length > 0 && (
          <span className="flex items-center gap-[2px] text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              chat_bubble
            </span>
            {task.comments.length}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pl-[26px] text-body-sm text-on-surface-variant">
        <span className="flex min-w-0 items-center gap-xs">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            person
          </span>
          <span className="truncate">{task.assignee}</span>
        </span>
        <span className={isOverdue ? "shrink-0 font-semibold text-error" : "shrink-0"}>
          {dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>
    </div>
  );
}
