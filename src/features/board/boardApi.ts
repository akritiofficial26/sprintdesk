import { jsonPlaceholderApi } from "../../lib/axios";
import type { ColumnId, Priority, Task } from "../../types";

interface JsonPlaceholderTodo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

interface JsonPlaceholderUser {
  id: number;
  name: string;
}

const PRIORITIES: Priority[] = ["low", "medium", "high"];
const NON_DONE_COLUMNS: ColumnId[] = ["backlog", "in-progress", "review"];

function priorityFor(id: number): Priority {
  return PRIORITIES[id % PRIORITIES.length];
}

function columnFor(todo: JsonPlaceholderTodo): ColumnId {
  if (todo.completed) return "done";
  return NON_DONE_COLUMNS[todo.id % NON_DONE_COLUMNS.length];
}

function dueDateFor(id: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + ((id * 3) % 21) - 7);
  return date.toISOString();
}

export async function fetchBoardTasks(): Promise<Task[]> {
  const [todosRes, usersRes] = await Promise.all([
    jsonPlaceholderApi.get<JsonPlaceholderTodo[]>("/todos", { params: { _limit: 30 } }),
    jsonPlaceholderApi.get<JsonPlaceholderUser[]>("/users"),
  ]);

  const userNameById = new Map(usersRes.data.map((u) => [u.id, u.name]));

  return todosRes.data.map((todo) => {
    const columnId = columnFor(todo);
    const dueDate = dueDateFor(todo.id);
    return {
      id: todo.id,
      title: todo.title.charAt(0).toUpperCase() + todo.title.slice(1),
      description: "",
      columnId,
      priority: priorityFor(todo.id),
      assignee: userNameById.get(todo.userId) ?? `User ${todo.userId}`,
      dueDate,
      comments: [],
      createdAt: new Date().toISOString(),
      completedAt: columnId === "done" ? dueDate : undefined,
    };
  });
}
