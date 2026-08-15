import { describe, it, expect } from "vitest";
import {
  getStatusDistribution,
  getPriorityBreakdown,
  getSprintVelocity,
  getCompletionTrend,
} from "./analyticsSelectors";
import type { Task } from "../../types";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: "Task",
    description: "",
    columnId: "backlog",
    priority: "medium",
    assignee: "Alex",
    dueDate: "2026-08-10T00:00:00.000Z",
    comments: [],
    createdAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("analyticsSelectors", () => {
  it("getStatusDistribution counts tasks per column in a fixed order", () => {
    const tasks = {
      1: makeTask({ id: 1, columnId: "backlog" }),
      2: makeTask({ id: 2, columnId: "backlog" }),
      3: makeTask({ id: 3, columnId: "done" }),
    };
    const result = getStatusDistribution(tasks);
    expect(result.map((r) => r.columnId)).toEqual(["backlog", "in-progress", "review", "done"]);
    expect(result.find((r) => r.columnId === "backlog")?.value).toBe(2);
    expect(result.find((r) => r.columnId === "done")?.value).toBe(1);
    expect(result.find((r) => r.columnId === "review")?.value).toBe(0);
  });

  it("getPriorityBreakdown buckets each column's tasks by priority", () => {
    const tasks = {
      1: makeTask({ id: 1, columnId: "backlog", priority: "low" }),
      2: makeTask({ id: 2, columnId: "backlog", priority: "high" }),
      3: makeTask({ id: 3, columnId: "done", priority: "high" }),
    };
    const result = getPriorityBreakdown(tasks);
    const backlogRow = result.find((r) => r.column === "Backlog")!;
    expect(backlogRow).toMatchObject({ low: 1, medium: 0, high: 1 });
    const doneRow = result.find((r) => r.column === "Done")!;
    expect(doneRow).toMatchObject({ low: 0, medium: 0, high: 1 });
  });

  it("getSprintVelocity groups tasks by due-date week and counts completed vs total", () => {
    const tasks = {
      1: makeTask({ id: 1, dueDate: "2026-08-10T00:00:00.000Z", columnId: "done" }),
      2: makeTask({ id: 2, dueDate: "2026-08-11T00:00:00.000Z", columnId: "backlog" }),
      3: makeTask({ id: 3, dueDate: "2026-08-24T00:00:00.000Z", columnId: "done" }),
    };
    const result = getSprintVelocity(tasks);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ sprint: "Sprint 1", completed: 1, total: 2 });
    expect(result[1]).toEqual({ sprint: "Sprint 2", completed: 1, total: 1 });
  });

  it("getCompletionTrend ignores incomplete tasks and returns a chronological cumulative count", () => {
    const tasks = {
      1: makeTask({ id: 1, completedAt: "2026-08-10T00:00:00.000Z" }),
      2: makeTask({ id: 2, completedAt: "2026-08-10T12:00:00.000Z" }),
      3: makeTask({ id: 3, completedAt: "2026-08-12T00:00:00.000Z" }),
      4: makeTask({ id: 4, completedAt: undefined }),
    };
    const result = getCompletionTrend(tasks);
    expect(result).toHaveLength(2);
    expect(result[0].cumulative).toBe(2);
    expect(result[1].cumulative).toBe(3);
  });

  it("getCompletionTrend returns an empty array when nothing is completed", () => {
    const tasks = { 1: makeTask({ completedAt: undefined }) };
    expect(getCompletionTrend(tasks)).toEqual([]);
  });
});
