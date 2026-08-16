import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import type { ColumnId, Priority, Task } from "../../../types";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { useFocusTrap } from "../../../components/ui/useFocusTrap";
import { COLUMN_ORDER, COLUMN_TITLES, useBoardStore } from "../../../store/boardStore";
import { useAuthStore } from "../../../store/authStore";

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

interface TaskDrawerProps {
  task: Task | null;
  onClose: () => void;
  onRequestDelete: (task: Task) => void;
}

export function TaskDrawer({ task, onClose, onRequestDelete }: TaskDrawerProps) {
  const updateTask = useBoardStore((s) => s.updateTask);
  const addComment = useBoardStore((s) => s.addComment);
  const currentUser = useAuthStore((s) => s.user);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Task | null>(task);
  const [commentText, setCommentText] = useState("");
  const drawerRef = useFocusTrap<HTMLDivElement>(task !== null);

  useEffect(() => {
    setDraft(task);
    setIsEditing(false);
    setCommentText("");
  }, [task]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    if (task) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [task, onClose]);

  if (!task || !draft) return null;

  function handleSave() {
    if (!draft) return;
    updateTask(draft.id, {
      title: draft.title,
      description: draft.description,
      priority: draft.priority,
      assignee: draft.assignee,
      dueDate: draft.dueDate,
      columnId: draft.columnId,
    });
    setIsEditing(false);
  }

  function handleAddComment(event: FormEvent) {
    event.preventDefault();
    if (!commentText.trim() || !task) return;
    addComment(task.id, currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "You", commentText.trim());
    setCommentText("");
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-inverse-surface/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
        tabIndex={-1}
        className="relative z-10 flex h-full w-full max-w-md flex-col gap-lg overflow-y-auto border-l border-outline-variant bg-surface-bright p-lg shadow-subtle outline-none"
      >
        <div className="flex items-start justify-between gap-sm">
          {isEditing ? (
            <Input
              label="Title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="flex-1"
            />
          ) : (
            <h2 className="text-headline-sm text-on-surface">{task.title}</h2>
          )}
          <button
            onClick={onClose}
            aria-label="Close task details"
            className="shrink-0 text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-md">
            <label className="flex flex-col gap-xs text-label-md text-on-surface-variant">
              Description
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-outline-variant bg-surface-bright p-md text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <Select
              label="Column"
              value={draft.columnId}
              onChange={(e) => setDraft({ ...draft, columnId: e.target.value as ColumnId })}
              options={COLUMN_ORDER.map((id) => ({ value: id, label: COLUMN_TITLES[id] }))}
            />
            <Select
              label="Priority"
              value={draft.priority}
              onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}
              options={PRIORITY_OPTIONS}
            />
            <Input
              label="Assignee"
              value={draft.assignee}
              onChange={(e) => setDraft({ ...draft, assignee: e.target.value })}
            />
            <Input
              label="Due date"
              type="date"
              value={draft.dueDate.slice(0, 10)}
              onChange={(e) => setDraft({ ...draft, dueDate: new Date(e.target.value).toISOString() })}
            />
            <div className="flex justify-end gap-sm">
              <Button
                variant="secondary"
                onClick={() => {
                  setDraft(task);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>Save changes</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            {task.description && <p className="text-body-md text-on-surface-variant">{task.description}</p>}
            <dl className="grid grid-cols-2 gap-md text-body-sm">
              <div>
                <dt className="text-on-surface-variant">Column</dt>
                <dd className="font-medium text-on-surface">{COLUMN_TITLES[task.columnId]}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Priority</dt>
                <dd className="font-medium capitalize text-on-surface">{task.priority}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Assignee</dt>
                <dd className="font-medium text-on-surface">{task.assignee}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Due date</dt>
                <dd className="font-medium text-on-surface">
                  {new Date(task.dueDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </dd>
              </div>
            </dl>
            <div className="flex gap-sm pt-sm">
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  edit
                </span>
                Edit
              </Button>
              <Button variant="danger" onClick={() => onRequestDelete(task)}>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  delete
                </span>
                Delete
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-md border-t border-outline-variant pt-lg">
          <h3 className="text-body-lg font-semibold text-on-surface">Comments ({task.comments.length})</h3>
          <ul className="flex flex-col gap-sm">
            {task.comments.map((comment) => (
              <li key={comment.id} className="rounded-lg bg-surface-container-low p-md">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm font-semibold text-on-surface">{comment.author}</span>
                  <span className="text-body-sm text-on-surface-variant">
                    {new Date(comment.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-xs text-body-md text-on-surface">{comment.text}</p>
              </li>
            ))}
            {task.comments.length === 0 && (
              <p className="text-body-sm text-on-surface-variant">No comments yet.</p>
            )}
          </ul>
          <form onSubmit={handleAddComment} className="flex gap-sm">
            <label htmlFor="new-comment" className="sr-only">
              Add a comment
            </label>
            <input
              id="new-comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 rounded-lg border border-outline-variant bg-surface-bright px-md py-sm text-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <Button type="submit" size="sm">
              Post
            </Button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
