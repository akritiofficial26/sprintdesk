import { describe, it, expect, beforeEach } from "vitest";
import { useBoardStore } from "./boardStore";
import type { Task } from "../types";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: "Write tests",
    description: "",
    columnId: "backlog",
    priority: "medium",
    assignee: "Alex",
    dueDate: new Date().toISOString(),
    comments: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("boardStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useBoardStore.setState({
      tasks: {},
      columns: { backlog: [], "in-progress": [], review: [], done: [] },
      hasLoaded: false,
      lastMove: null,
      filters: { priority: "all", assignee: "all" },
    });
  });

  it("initializeFromApi seeds tasks into their columns once", () => {
    const tasks = [makeTask({ id: 1, columnId: "backlog" }), makeTask({ id: 2, columnId: "done" })];
    useBoardStore.getState().initializeFromApi(tasks);

    expect(useBoardStore.getState().columns.backlog).toEqual([1]);
    expect(useBoardStore.getState().columns.done).toEqual([2]);
    expect(useBoardStore.getState().hasLoaded).toBe(true);

    useBoardStore.getState().initializeFromApi([makeTask({ id: 99, columnId: "review" })]);
    expect(useBoardStore.getState().tasks[99]).toBeUndefined();
  });

  it("addTask appends a new task with an incremented id into the target column", () => {
    useBoardStore.getState().initializeFromApi([makeTask({ id: 5, columnId: "backlog" })]);

    useBoardStore.getState().addTask({
      title: "New task",
      priority: "high",
      assignee: "Sam",
      dueDate: new Date().toISOString(),
      columnId: "review",
    });

    const state = useBoardStore.getState();
    expect(state.columns.review).toHaveLength(1);
    const newId = state.columns.review[0];
    expect(state.tasks[newId].title).toBe("New task");
    expect(state.tasks[newId].columnId).toBe("review");
  });

  it("moveTask moves a task between columns and updates its columnId", () => {
    useBoardStore.getState().initializeFromApi([
      makeTask({ id: 1, columnId: "backlog" }),
      makeTask({ id: 2, columnId: "backlog" }),
    ]);

    useBoardStore.getState().moveTask(1, "in-progress", 0);

    const state = useBoardStore.getState();
    expect(state.columns.backlog).toEqual([2]);
    expect(state.columns["in-progress"]).toEqual([1]);
    expect(state.tasks[1].columnId).toBe("in-progress");
  });

  it("moveTask reorders within the same column", () => {
    useBoardStore.getState().initializeFromApi([
      makeTask({ id: 1, columnId: "backlog" }),
      makeTask({ id: 2, columnId: "backlog" }),
      makeTask({ id: 3, columnId: "backlog" }),
    ]);

    useBoardStore.getState().moveTask(3, "backlog", 0);

    expect(useBoardStore.getState().columns.backlog).toEqual([3, 1, 2]);
  });

  it("undoLastMove reverts the most recent move", () => {
    useBoardStore.getState().initializeFromApi([makeTask({ id: 1, columnId: "backlog" })]);
    useBoardStore.getState().moveTask(1, "done", 0);
    expect(useBoardStore.getState().columns.done).toEqual([1]);

    useBoardStore.getState().undoLastMove();

    expect(useBoardStore.getState().columns.backlog).toEqual([1]);
    expect(useBoardStore.getState().columns.done).toEqual([]);
    expect(useBoardStore.getState().lastMove).toBeNull();
  });

  it("deleteTask removes the task from its column and the task map", () => {
    useBoardStore.getState().initializeFromApi([
      makeTask({ id: 1, columnId: "backlog" }),
      makeTask({ id: 2, columnId: "backlog" }),
    ]);

    useBoardStore.getState().deleteTask(1);

    const state = useBoardStore.getState();
    expect(state.tasks[1]).toBeUndefined();
    expect(state.columns.backlog).toEqual([2]);
  });

  it("addComment appends a comment to the task", () => {
    useBoardStore.getState().initializeFromApi([makeTask({ id: 1 })]);
    useBoardStore.getState().addComment(1, "Alex", "Looks good");

    const comments = useBoardStore.getState().tasks[1].comments;
    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({ author: "Alex", text: "Looks good" });
  });
});
