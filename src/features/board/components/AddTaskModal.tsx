import { useState, type FormEvent } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import type { ColumnId, Priority } from "../../../types";
import { COLUMN_ORDER, COLUMN_TITLES, useBoardStore } from "../../../store/boardStore";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultColumnId: ColumnId;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AddTaskModal({ isOpen, onClose, defaultColumnId }: AddTaskModalProps) {
  const addTask = useBoardStore((s) => s.addTask);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState(todayIso());
  const [column, setColumn] = useState<ColumnId>(defaultColumnId);
  const [error, setError] = useState("");

  function reset() {
    setTitle("");
    setPriority("medium");
    setAssignee("");
    setDueDate(todayIso());
    setColumn(defaultColumnId);
    setError("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!assignee.trim()) {
      setError("Assignee is required.");
      return;
    }

    addTask({
      title: title.trim(),
      priority,
      assignee: assignee.trim(),
      dueDate: new Date(dueDate).toISOString(),
      columnId: column,
    });
    handleClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add task">
      <form onSubmit={handleSubmit} className="flex flex-col gap-md">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error && !title.trim() ? error : undefined}
          autoFocus
        />
        <Select
          label="Column"
          value={column}
          onChange={(e) => setColumn(e.target.value as ColumnId)}
          options={COLUMN_ORDER.map((id) => ({ value: id, label: COLUMN_TITLES[id] }))}
        />
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          options={PRIORITY_OPTIONS}
        />
        <Input
          label="Assignee"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          error={error && !assignee.trim() ? error : undefined}
        />
        <Input
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <div className="flex justify-end gap-sm pt-sm">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Add task</Button>
        </div>
      </form>
    </Modal>
  );
}
