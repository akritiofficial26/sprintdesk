import { memo } from "react";
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

function BoardColumnComponent({ columnId, title, taskIds, tasks, onOpenTask, onAddTask }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <div
      ref={setNodeRef}
      className="flex w-[280px] shrink-0 flex-col gap-md rounded-lg bg-surface-container-low p-md sm:w-[300px] md:min-h-0"
    >
      <div className="flex items-center justify-between gap-sm">
        <h2 className="text-body-lg font-semibold text-on-surface">{title}</h2>
        <div className="flex items-center gap-sm">
          <span
            aria-label={`${taskIds.length} tasks`}
            className="rounded-full bg-surface-container-highest px-sm py-[2px] text-label-md text-on-surface-variant"
          >
            {taskIds.length}
          </span>
          <button
            onClick={() => onAddTask(columnId)}
            aria-label={`Add task to ${title}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              add
            </span>
          </button>
        </div>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          className={[
            "flex min-h-[80px] flex-1 flex-col gap-sm rounded-lg p-xs transition-colors",
            "md:min-h-0 md:overflow-y-auto",
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
    </div>
  );
}

export const BoardColumn = memo(BoardColumnComponent);

BoardColumn.displayName = "BoardColumn";
