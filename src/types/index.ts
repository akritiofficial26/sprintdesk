// ---- Auth ----
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}

export interface LoginResponse extends User {
  accessToken: string;
  refreshToken: string;
}

// ---- Board / Tasks ----
export type ColumnId = "backlog" | "in-progress" | "review" | "done";

export type Priority = "low" | "medium" | "high";

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  columnId: ColumnId;
  priority: Priority;
  assignee: string;
  dueDate: string; // ISO date
  comments: Comment[];
  createdAt: string;
}

export interface Column {
  id: ColumnId;
  title: string;
  taskIds: number[];
}

// ---- Notifications ----
export interface AppNotification {
  id: number;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}
