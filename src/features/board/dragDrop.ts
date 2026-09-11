import { closestCorners, pointerWithin, rectIntersection, type CollisionDetection } from "@dnd-kit/core";
import { COLUMN_ORDER } from "../../store/boardStore";
import type { ColumnId, Task } from "../../types";

export function asColumnId(id: string | number): ColumnId | null {
  const value = String(id);
  return (COLUMN_ORDER as string[]).includes(value) ? (value as ColumnId) : null;
}


export function createBoardCollisionDetection(
  visibleColumns: Record<ColumnId, number[]>
): CollisionDetection {
  return (args) => {
    const pointerCollisions = pointerWithin(args);
    const collisions = pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args);

    const top = collisions[0];
    if (!top) return closestCorners(args);

    const columnId = asColumnId(top.id);
    if (!columnId) return collisions;

    const cardIds = visibleColumns[columnId].filter((id) => id !== Number(args.active.id));
    if (cardIds.length === 0) return collisions;

    const cardContainers = args.droppableContainers.filter((container) =>
      cardIds.includes(Number(container.id))
    );
    const cardCollisions = closestCorners({ ...args, droppableContainers: cardContainers });
    return cardCollisions.length > 0 ? cardCollisions : collisions;
  };
}

export function resolveDropTarget(
  overId: string | number,
  columns: Record<ColumnId, number[]>,
  tasks: Record<number, Task>
): { columnId: ColumnId; index: number } | null {
  const columnId = asColumnId(overId);
  if (columnId) return { columnId, index: columns[columnId].length };

  const overTask = tasks[Number(overId)];
  if (!overTask) return null;
  return { columnId: overTask.columnId, index: columns[overTask.columnId].indexOf(overTask.id) };
}
