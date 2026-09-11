import { describe, it, expect } from "vitest";
import type { ClientRect, DroppableContainer } from "@dnd-kit/core";
import { asColumnId, createBoardCollisionDetection, resolveDropTarget } from "./dragDrop";
import type { ColumnId, Task } from "../../types";

function rect(left: number, top: number, width: number, height: number): ClientRect {
  return {
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
}

function makeTask(id: number, columnId: ColumnId): Task {
  return {
    id,
    title: `Task ${id}`,
    description: "",
    columnId,
    priority: "medium",
    assignee: "Alex",
    dueDate: new Date().toISOString(),
    comments: [],
    createdAt: new Date().toISOString(),
  };
}

const emptyColumns = (): Record<ColumnId, number[]> => ({
  backlog: [],
  "in-progress": [],
  review: [],
  done: [],
});

const BACKLOG_RECT = rect(0, 0, 300, 600);
const IN_PROGRESS_RECT = rect(320, 0, 300, 600);
const CARD_RECTS: Record<number, ClientRect> = {
  1: rect(10, 60, 280, 100),
  2: rect(10, 170, 280, 100),
  3: rect(10, 280, 280, 100),
};

function buildArgs(options: {
  activeId: number;
  pointer: { x: number; y: number } | null;
  collisionRect: ClientRect;
  cardIds?: number[];
}) {
  const cardIds = options.cardIds ?? [1, 2, 3];
  const droppableRects = new Map<string | number, ClientRect>([
    ["backlog", BACKLOG_RECT],
    ["in-progress", IN_PROGRESS_RECT],
    ...cardIds.map((id) => [id, CARD_RECTS[id]] as [number, ClientRect]),
  ]);

  const droppableContainers = [...droppableRects.keys()].map(
    (id) => ({ id, rect: { current: droppableRects.get(id)! }, data: { current: {} } }) as unknown as DroppableContainer
  );

  return {
    active: { id: options.activeId, data: { current: {} }, rect: { current: { initial: null, translated: null } } },
    collisionRect: options.collisionRect,
    droppableRects,
    droppableContainers,
    pointerCoordinates: options.pointer,
  } as unknown as Parameters<ReturnType<typeof createBoardCollisionDetection>>[0];
}

describe("asColumnId", () => {
  it("recognises column ids and rejects task ids", () => {
    expect(asColumnId("in-progress")).toBe("in-progress");
    expect(asColumnId("done")).toBe("done");
    expect(asColumnId(7)).toBeNull();
    expect(asColumnId("nope")).toBeNull();
  });
});

describe("createBoardCollisionDetection", () => {
  it("targets an empty column when the pointer is over it", () => {
    const visible = { ...emptyColumns(), backlog: [1, 2, 3] };
    const detect = createBoardCollisionDetection(visible);

    const collisions = detect(
      buildArgs({ activeId: 1, pointer: { x: 470, y: 300 }, collisionRect: rect(430, 260, 280, 100) })
    );

    expect(collisions[0]?.id).toBe("in-progress");
  });

  it("targets an empty column when it was emptied by the active card leaving it", () => {
    const visible = { ...emptyColumns(), backlog: [1, 2, 3], "in-progress": [1] };
    const detect = createBoardCollisionDetection(visible);

    const collisions = detect(
      buildArgs({ activeId: 1, pointer: { x: 470, y: 300 }, collisionRect: rect(430, 260, 280, 100) })
    );

    expect(collisions[0]?.id).toBe("in-progress");
  });

  it("treats the column heading and footer as part of the empty column's drop zone", () => {
    const visible = { ...emptyColumns(), backlog: [1, 2, 3] };
    const detect = createBoardCollisionDetection(visible);

    for (const y of [20, 560]) {
      const collisions = detect(
        buildArgs({ activeId: 1, pointer: { x: 470, y }, collisionRect: rect(430, y - 40, 280, 100) })
      );
      expect(collisions[0]?.id).toBe("in-progress");
    }
  });

  it("still resolves to the nearest card when the column has cards", () => {
    const visible = { ...emptyColumns(), backlog: [1, 2, 3] };
    const detect = createBoardCollisionDetection(visible);

    const collisions = detect(
      buildArgs({ activeId: 3, pointer: { x: 150, y: 190 }, collisionRect: rect(10, 150, 280, 100) })
    );

    expect(collisions[0]?.id).toBe(2);
  });

  it("leaves a card dropped back on itself where it already is", () => {
    const visible = { ...emptyColumns(), backlog: [1, 2, 3] };
    const detect = createBoardCollisionDetection(visible);

    const collisions = detect(
      buildArgs({ activeId: 2, pointer: { x: 150, y: 200 }, collisionRect: CARD_RECTS[2] })
    );

    const tasks: Record<number, Task> = {
      1: makeTask(1, "backlog"),
      2: makeTask(2, "backlog"),
      3: makeTask(3, "backlog"),
    };
    const columns: Record<ColumnId, number[]> = { ...emptyColumns(), backlog: [1, 2, 3] };

    expect(resolveDropTarget(collisions[0]!.id, columns, tasks)).toEqual({
      columnId: "backlog",
      index: 1,
    });
  });

  it("falls back to rect intersection when there is no pointer (keyboard drag)", () => {
    const visible = { ...emptyColumns(), backlog: [1, 2, 3] };
    const detect = createBoardCollisionDetection(visible);

    const collisions = detect(
      buildArgs({ activeId: 1, pointer: null, collisionRect: rect(430, 260, 280, 100) })
    );

    expect(collisions[0]?.id).toBe("in-progress");
  });
});

describe("resolveDropTarget", () => {
  const tasks: Record<number, Task> = {
    1: makeTask(1, "backlog"),
    2: makeTask(2, "backlog"),
    3: makeTask(3, "review"),
  };
  const columns: Record<ColumnId, number[]> = {
    backlog: [1, 2],
    "in-progress": [],
    review: [3],
    done: [],
  };

  it("appends to the end of an empty column dropped on directly", () => {
    expect(resolveDropTarget("in-progress", columns, tasks)).toEqual({ columnId: "in-progress", index: 0 });
  });

  it("appends to the end of a populated column dropped on directly", () => {
    expect(resolveDropTarget("backlog", columns, tasks)).toEqual({ columnId: "backlog", index: 2 });
  });

  it("uses the hovered card's position when dropped on a card", () => {
    expect(resolveDropTarget(2, columns, tasks)).toEqual({ columnId: "backlog", index: 1 });
    expect(resolveDropTarget(3, columns, tasks)).toEqual({ columnId: "review", index: 0 });
  });

  it("returns null for an unknown droppable", () => {
    expect(resolveDropTarget(99, columns, tasks)).toBeNull();
  });
});
