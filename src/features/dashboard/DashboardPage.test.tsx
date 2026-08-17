import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardPage from "./DashboardPage";
import { useBoardStore } from "../../store/boardStore";
import { useAuthStore } from "../../store/authStore";
import type { Task } from "../../types";

function task(overrides: Partial<Task> & Pick<Task, "id">): Task {
  return {
    title: `Task ${overrides.id}`,
    description: "",
    columnId: "backlog",
    priority: "low",
    assignee: "Leanne Graham",
    dueDate: "2026-03-01T00:00:00.000Z",
    comments: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const TASKS: Task[] = [
  task({ id: 1, title: "Write the sprint spec", columnId: "done", priority: "high", assignee: "Ervin Howell", dueDate: "2026-02-10T00:00:00.000Z" }),
  task({ id: 2, title: "Fix the drag handle", columnId: "in-progress", priority: "medium", assignee: "Leanne Graham", dueDate: "2026-02-20T00:00:00.000Z" }),
  task({ id: 3, title: "Ship analytics", columnId: "review", priority: "low", assignee: "Clementine Bauch", dueDate: "2026-03-05T00:00:00.000Z" }),
  task({ id: 4, title: "Audit accessibility", columnId: "backlog", priority: "high", assignee: "Patricia Lebsack", dueDate: "2026-03-12T00:00:00.000Z" }),
];

function seedBoard(tasks: Task[]) {
  const byId: Record<number, Task> = {};
  const columns = { backlog: [] as number[], "in-progress": [] as number[], review: [] as number[], done: [] as number[] };
  for (const t of tasks) {
    byId[t.id] = t;
    columns[t.columnId].push(t.id);
  }
  
  useBoardStore.setState({ tasks: byId, columns, hasLoaded: true });
}

function renderDashboard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardPage />
    </QueryClientProvider>
  );
}


function tableTitles(): string[] {
  return within(screen.getByRole("table"))
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0].textContent);
}

describe("DashboardPage", () => {
  beforeEach(() => {
    seedBoard(TASKS);
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false, isInitializing: false });
  });

  it("summarises the board: totals and completion rate come from the store", () => {
    renderDashboard();

    // 1 of 4 tasks is done.
    expect(screen.getByText("Total").closest("article")).toHaveTextContent("4");
    expect(screen.getAllByText("25%").length).toBeGreaterThan(0);
  });

  it("greets the authenticated user by first name", () => {
    useAuthStore.setState({
      user: { id: 1, username: "emilys", email: "e@x.com", firstName: "Emily", lastName: "Johnson", image: "" },
      isAuthenticated: true,
    });

    renderDashboard();

    expect(screen.getByRole("heading", { name: "Welcome, Emily" })).toBeInTheDocument();
  });

  it("renders every sprint task in the DataTable", () => {
    renderDashboard();

    expect(tableTitles()).toHaveLength(TASKS.length);
    expect(screen.getByRole("cell", { name: "Ship analytics" })).toBeInTheDocument();
  });

  it("sorts the task table by priority in severity order, not alphabetically", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole("button", { name: "Priority" }));

   
    const priorities = within(screen.getByRole("table"))
      .getAllByRole("row")
      .slice(1)
      .map((row) => within(row).getAllByRole("cell")[2].textContent);
    expect(priorities).toEqual(["low", "medium", "high", "high"]);
  });

  it("sorts the task table by status in board order, not alphabetically", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole("button", { name: "Status" }));

    const statuses = within(screen.getByRole("table"))
      .getAllByRole("row")
      .slice(1)
      .map((row) => within(row).getAllByRole("cell")[1].textContent);
    expect(statuses).toEqual(["Backlog", "In Progress", "Review", "Done"]);
  });

  it("shows the three soonest due tasks under Upcoming work", () => {
    renderDashboard();

    const upcoming = screen.getByRole("heading", { name: "Upcoming work" }).closest("article");
    expect(upcoming).toHaveTextContent("Write the sprint spec");
    expect(upcoming).toHaveTextContent("Fix the drag handle");
    expect(upcoming).not.toHaveTextContent("Audit accessibility");
  });

  it("renders an empty state when the board has no tasks", () => {
    seedBoard([]);

    renderDashboard();

    expect(screen.getByText("No sprint tasks yet.")).toBeInTheDocument();
    expect(screen.getByText("No upcoming tasks.")).toBeInTheDocument();
  });
});
