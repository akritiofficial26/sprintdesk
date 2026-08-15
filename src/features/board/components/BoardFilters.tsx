import { useMemo } from "react";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { useBoardStore } from "../../../store/boardStore";

export function BoardFilters() {
  const tasks = useBoardStore((s) => s.tasks);
  const filters = useBoardStore((s) => s.filters);
  const setFilters = useBoardStore((s) => s.setFilters);
  const lastMove = useBoardStore((s) => s.lastMove);
  const undoLastMove = useBoardStore((s) => s.undoLastMove);

  const assignees = useMemo(() => {
    const unique = new Set(Object.values(tasks).map((task) => task.assignee));
    return Array.from(unique).sort();
  }, [tasks]);

  return (
    <div className="flex flex-wrap items-end gap-md">
      <Select
        label="Priority"
        value={filters.priority}
        onChange={(e) => setFilters({ priority: e.target.value as typeof filters.priority })}
        options={[
          { value: "all", label: "All priorities" },
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
        ]}
        className="min-w-[160px]"
      />
      <Select
        label="Assignee"
        value={filters.assignee}
        onChange={(e) => setFilters({ assignee: e.target.value })}
        options={[{ value: "all", label: "All assignees" }, ...assignees.map((a) => ({ value: a, label: a }))]}
        className="min-w-[160px]"
      />
      {lastMove && (
        <Button variant="ghost" onClick={undoLastMove}>
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            undo
          </span>
          Undo move
        </Button>
      )}
    </div>
  );
}
