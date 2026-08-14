export default function BoardPage() {
  return (
    <div className="flex flex-col gap-md">
      <div>
        <h1 className="text-headline-md text-on-surface">Sprint Board</h1>
        <p className="text-body-md text-on-surface-variant">
          Backlog · In Progress · Review · Done
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-2xl text-center">
        <p className="text-body-md text-on-surface-variant">
          The drag-and-drop Kanban board (Zustand + @dnd-kit + JSONPlaceholder tasks) lands in
          the next phase.
        </p>
      </div>
    </div>
  );
}
