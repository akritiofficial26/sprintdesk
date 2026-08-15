import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ColumnId, Task } from "../../../types";
import { TaskCard } from "./TaskCard";

interface BoardColumnProps {
  columnId: ColumnId;
  title: string;
  taskIds: number[];
  tasks: Record<number, Task>;
  onOpenTask: (task: Task) => void;
  onAddTask: (columnId: ColumnId) => void;
}

export function BoardColumn({ columnId, title, taskIds, tasks, onOpenTask, onAddTask }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <div className="flex w-[280px] shrink-0 flex-col gap-md rounded-lg bg-surface-container-low p-md sm:w-[300px]">
      <div className="flex items-center justify-between">
        <h2 className="text-body-lg font-semibold text-on-surface">{title}</h2>
        <span
          aria-label={`${taskIds.length} tasks`}
          className="rounded-full bg-surface-container-highest px-sm py-[2px] text-label-md text-on-surface-variant"
        >
          {taskIds.length}
        </span>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={[
            "flex min-h-[80px] flex-1 flex-col gap-sm rounded-lg p-xs transition-colors",
            isOver ? "bg-primary-container/20" : "",
          ].join(" ")}
        >
          {taskIds.map((id) => {
            const task = tasks[id];
            if (!task) return null;
            return <TaskCard key={id} task={task} onOpen={onOpenTask} />;
          })}
          {taskIds.length === 0 && (
            <p className="p-md text-center text-body-sm text-on-surface-variant">No tasks</p>
          )}
        </div>
      </SortableContext>

      <button
        onClick={() => onAddTask(columnId)}
        className="flex items-center justify-center gap-xs rounded-lg border border-dashed border-outline-variant py-sm text-body-sm text-on-surface-variant transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          add
        </span>
        Add task
      </button>
    </div>
  );
}
