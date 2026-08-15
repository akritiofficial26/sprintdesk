import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ColumnId, Priority, Task } from "../types";

export const COLUMN_ORDER: ColumnId[] = ["backlog", "in-progress", "review", "done"];

export const COLUMN_TITLES: Record<ColumnId, string> = {
  backlog: "Backlog",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

interface MoveSnapshot {
  taskId: number;
  fromColumn: ColumnId;
  fromIndex: number;
  toColumn: ColumnId;
  toIndex: number;
}

export interface NewTaskInput {
  title: string;
  priority: Priority;
  assignee: string;
  dueDate: string;
  description?: string;
  columnId?: ColumnId;
}

interface BoardFilters {
  priority: Priority | "all";
  assignee: string | "all";
}

interface BoardState {
  tasks: Record<number, Task>;
  columns: Record<ColumnId, number[]>;
  hasLoaded: boolean;
  lastMove: MoveSnapshot | null;
  filters: BoardFilters;

  initializeFromApi: (tasks: Task[]) => void;
  moveTask: (taskId: number, toColumn: ColumnId, toIndex: number) => void;
  addTask: (input: NewTaskInput) => void;
  updateTask: (id: number, patch: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  addComment: (taskId: number, author: string, text: string) => void;
  undoLastMove: () => void;
  setFilters: (patch: Partial<BoardFilters>) => void;
}

const emptyColumns = (): Record<ColumnId, number[]> => ({
  backlog: [],
  "in-progress": [],
  review: [],
  done: [],
});

function columnTransitionPatch(fromColumn: ColumnId, toColumn: ColumnId): Partial<Task> {
  if (fromColumn === toColumn) return {};
  if (toColumn === "done") return { completedAt: new Date().toISOString() };
  if (fromColumn === "done") return { completedAt: undefined };
  return {};
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      tasks: {},
      columns: emptyColumns(),
      hasLoaded: false,
      lastMove: null,
      filters: { priority: "all", assignee: "all" },

      initializeFromApi: (fetchedTasks) => {
        if (get().hasLoaded) return;

        const tasks: Record<number, Task> = {};
        const columns = emptyColumns();
        for (const task of fetchedTasks) {
          tasks[task.id] = task;
          columns[task.columnId].push(task.id);
        }
        set({ tasks, columns, hasLoaded: true });
      },

      moveTask: (taskId, toColumn, toIndex) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;

          const fromColumn = task.columnId;
          const fromIndex = state.columns[fromColumn].indexOf(taskId);
          if (fromIndex === -1) return state;

          const columns = { ...state.columns };
          const sourceIds = columns[fromColumn].filter((id) => id !== taskId);
          columns[fromColumn] = sourceIds;

          const destIds = fromColumn === toColumn ? sourceIds : [...columns[toColumn]];
          const clampedIndex = Math.max(0, Math.min(toIndex, destIds.length));
          destIds.splice(clampedIndex, 0, taskId);
          columns[toColumn] = destIds;

          return {
            columns,
            tasks: {
              ...state.tasks,
              [taskId]: { ...task, columnId: toColumn, ...columnTransitionPatch(fromColumn, toColumn) },
            },
            lastMove: { taskId, fromColumn, fromIndex, toColumn, toIndex: clampedIndex },
          };
        });
      },

      undoLastMove: () => {
        const { lastMove } = get();
        if (!lastMove) return;
        get().moveTask(lastMove.taskId, lastMove.fromColumn, lastMove.fromIndex);
        set({ lastMove: null });
      },

      addTask: (input) => {
        set((state) => {
          const id = Object.keys(state.tasks).reduce((max, key) => Math.max(max, Number(key)), 0) + 1;
          const columnId = input.columnId ?? "backlog";
          const task: Task = {
            id,
            title: input.title,
            description: input.description ?? "",
            columnId,
            priority: input.priority,
            assignee: input.assignee,
            dueDate: input.dueDate,
            comments: [],
            createdAt: new Date().toISOString(),
            completedAt: columnId === "done" ? new Date().toISOString() : undefined,
          };
          return {
            tasks: { ...state.tasks, [id]: task },
            columns: { ...state.columns, [columnId]: [...state.columns[columnId], id] },
          };
        });
      },

      updateTask: (id, patch) => {
        set((state) => {
          const task = state.tasks[id];
          if (!task) return state;

          const updatedTask = { ...task, ...patch };

          if (patch.columnId && patch.columnId !== task.columnId) {
            const fromColumn = task.columnId;
            const toColumn = patch.columnId;
            const columns = {
              ...state.columns,
              [fromColumn]: state.columns[fromColumn].filter((taskId) => taskId !== id),
              [toColumn]: [...state.columns[toColumn], id],
            };
            return {
              columns,
              tasks: { ...state.tasks, [id]: { ...updatedTask, ...columnTransitionPatch(fromColumn, toColumn) } },
            };
          }

          return { tasks: { ...state.tasks, [id]: updatedTask } };
        });
      },

      deleteTask: (id) => {
        set((state) => {
          const task = state.tasks[id];
          if (!task) return state;
          const tasks = { ...state.tasks };
          delete tasks[id];
          const columns = {
            ...state.columns,
            [task.columnId]: state.columns[task.columnId].filter((taskId) => taskId !== id),
          };
          return { tasks, columns };
        });
      },

      addComment: (taskId, author, text) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;
          const comment = {
            id: crypto.randomUUID(),
            author,
            text,
            createdAt: new Date().toISOString(),
          };
          return {
            tasks: { ...state.tasks, [taskId]: { ...task, comments: [...task.comments, comment] } },
          };
        });
      },

      setFilters: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),
    }),
    {
      name: "sprintdesk_board",
      partialize: (state) => ({ tasks: state.tasks, columns: state.columns, hasLoaded: state.hasLoaded }),
    }
  )
);
