import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEnsureBoardLoaded } from "./useEnsureBoardLoaded";
import { COLUMN_ORDER, COLUMN_TITLES, useBoardStore } from "../../store/boardStore";
import { BoardColumn } from "./components/BoardColumn";
import { BoardFilters } from "./components/BoardFilters";
import { TaskDrawer } from "./components/TaskDrawer";
import { AddTaskModal } from "./components/AddTaskModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import type { ColumnId, Task } from "../../types";

const PRIORITY_BADGE: Record<Task["priority"], string> = {
  low: "bg-secondary-container text-on-secondary-container",
  medium: "bg-warning-container text-warning",
  high: "bg-error-container text-on-error-container",
};

function TaskCardPreview({ task }: { task: Task }) {
  return (
    <div className="flex w-[248px] flex-col gap-sm rounded-lg border border-primary bg-surface-bright p-md shadow-subtle">
      <p className="text-body-md font-medium text-on-surface">{task.title}</p>
      <span
        className={`w-fit rounded px-sm py-[2px] text-label-md uppercase tracking-wide ${PRIORITY_BADGE[task.priority]}`}
      >
        {task.priority}
      </span>
    </div>
  );
}

export default function BoardPage() {
  const tasks = useBoardStore((s) => s.tasks);
  const columns = useBoardStore((s) => s.columns);
  const hasLoaded = useBoardStore((s) => s.hasLoaded);
  const filters = useBoardStore((s) => s.filters);
  const moveTask = useBoardStore((s) => s.moveTask);
  const deleteTask = useBoardStore((s) => s.deleteTask);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [openTaskId, setOpenTaskId] = useState<number | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [addModalColumn, setAddModalColumn] = useState<ColumnId | null>(null);

  const openTask = openTaskId !== null ? (tasks[openTaskId] ?? null) : null;
  const taskPendingDelete = deleteTaskId !== null ? (tasks[deleteTaskId] ?? null) : null;

  const { isLoading, isError } = useEnsureBoardLoaded();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredColumns = useMemo(() => {
    const result: Record<ColumnId, number[]> = { backlog: [], "in-progress": [], review: [], done: [] };
    for (const columnId of COLUMN_ORDER) {
      result[columnId] = columns[columnId].filter((id) => {
        const task = tasks[id];
        if (!task) return false;
        if (filters.priority !== "all" && task.priority !== filters.priority) return false;
        if (filters.assignee !== "all" && task.assignee !== filters.assignee) return false;
        return true;
      });
    }
    return result;
  }, [columns, tasks, filters]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks[Number(event.active.id)];
      setActiveTask(task ?? null);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);
      if (!over) return;

      const activeId = Number(active.id);
      const overId = String(over.id);

      if ((COLUMN_ORDER as string[]).includes(overId)) {
        const targetColumn = overId as ColumnId;
        moveTask(activeId, targetColumn, columns[targetColumn].length);
        return;
      }

      const overTask = tasks[Number(overId)];
      if (!overTask) return;
      const targetIndex = columns[overTask.columnId].indexOf(overTask.id);
      moveTask(activeId, overTask.columnId, targetIndex);
    },
    [columns, tasks, moveTask]
  );

  const handleOpenTask = useCallback((task: Task) => setOpenTaskId(task.id), []);
  const handleCloseTask = useCallback(() => setOpenTaskId(null), []);
  const handleRequestDelete = useCallback((task: Task) => setDeleteTaskId(task.id), []);
  const handleCancelDelete = useCallback(() => setDeleteTaskId(null), []);
  const handleCloseAddModal = useCallback(() => setAddModalColumn(null), []);

  const handleConfirmDelete = useCallback(() => {
    if (!taskPendingDelete) return;
    deleteTask(taskPendingDelete.id);
    setOpenTaskId((current) => (current === taskPendingDelete.id ? null : current));
    setDeleteTaskId(null);
  }, [taskPendingDelete, deleteTask]);

  if (isError) {
    return (
      <div className="rounded-lg border border-error-container bg-error-container/40 p-lg text-body-md text-on-error-container">
        Couldn't load sprint tasks. Please refresh the page to try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <h1 className="text-headline-md text-on-surface">Sprint Board</h1>
          <p className="text-body-md text-on-surface-variant">
            Backlog · In Progress · Review · Done
          </p>
        </div>
        <Button onClick={() => setAddModalColumn("backlog")}>
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            add
          </span>
          Add task
        </Button>
      </div>

      <BoardFilters />

      {isLoading && !hasLoaded ? (
        <div className="flex gap-md overflow-x-auto pb-sm">
          {COLUMN_ORDER.map((columnId) => (
            <div key={columnId} className="flex w-[280px] shrink-0 flex-col gap-sm">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-md overflow-x-auto pb-sm">
            {COLUMN_ORDER.map((columnId) => (
              <BoardColumn
                key={columnId}
                columnId={columnId}
                title={COLUMN_TITLES[columnId]}
                taskIds={filteredColumns[columnId]}
                tasks={tasks}
                onOpenTask={handleOpenTask}
                onAddTask={setAddModalColumn}
              />
            ))}
          </div>

          <DragOverlay>{activeTask && <TaskCardPreview task={activeTask} />}</DragOverlay>
        </DndContext>
      )}

      <TaskDrawer task={openTask} onClose={handleCloseTask} onRequestDelete={handleRequestDelete} />

      <AddTaskModal
        isOpen={addModalColumn !== null}
        defaultColumnId={addModalColumn ?? "backlog"}
        onClose={handleCloseAddModal}
      />

      <DeleteConfirmModal
        isOpen={taskPendingDelete !== null}
        taskTitle={taskPendingDelete?.title ?? ""}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
