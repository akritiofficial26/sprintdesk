import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type DataTableColumn } from "./DataTable";

interface Row {
  id: number;
  title: string;
  assignee: string;
  points: number;
}

const rows: Row[] = [
  { id: 1, title: "Write the sprint spec", assignee: "Ravi", points: 5 },
  { id: 2, title: "Fix the drag handle", assignee: "Ana", points: 13 },
  { id: 3, title: "Ship analytics", assignee: "Mei", points: 3 },
];

const columns: DataTableColumn<Row>[] = [
  { key: "title", header: "Title", sortValue: (row) => row.title },
  { key: "assignee", header: "Assignee" },
  {
    key: "points",
    header: "Points",
    sortValue: (row) => row.points,
    render: (row) => `${row.points} pts`,
  },
];

function renderTable(props: Partial<Parameters<typeof DataTable<Row>>[0]> = {}) {
  return render(
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(row) => row.id}
      caption="Sprint tasks"
      {...props}
    />
  );
}

/** Body rows only — `getAllByRole("row")` also returns the header row. */
function titleColumn(): string[] {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0].textContent);
}

describe("DataTable", () => {
  it("renders one row per item, in source order, using each column's renderer", () => {
    renderTable();

    expect(screen.getAllByRole("row")).toHaveLength(rows.length + 1);
    expect(titleColumn()).toEqual([
      "Write the sprint spec",
      "Fix the drag handle",
      "Ship analytics",
    ]);
    expect(screen.getByRole("cell", { name: "13 pts" })).toBeInTheDocument();
  });

  it("names the table from its caption without showing it visually", () => {
    renderTable();

    expect(screen.getByRole("table", { name: "Sprint tasks" })).toBeInTheDocument();
  });

  it("sorts ascending on the first click and toggles to descending on the second", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole("button", { name: "Title" }));

    expect(titleColumn()).toEqual([
      "Fix the drag handle",
      "Ship analytics",
      "Write the sprint spec",
    ]);

    await user.click(screen.getByRole("button", { name: "Title" }));

    expect(titleColumn()).toEqual([
      "Write the sprint spec",
      "Ship analytics",
      "Fix the drag handle",
    ]);
  });

  it("sorts numerically, not lexically, when sortValue returns a number", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole("button", { name: "Points" }));

    // Lexical ordering would put "13" before "3".
    expect(titleColumn()).toEqual([
      "Ship analytics",
      "Write the sprint spec",
      "Fix the drag handle",
    ]);
  });

  it("restarts at ascending when the sort moves to a different column", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole("button", { name: "Title" }));
    await user.click(screen.getByRole("button", { name: "Title" }));
    await user.click(screen.getByRole("button", { name: "Points" }));

    expect(screen.getByRole("columnheader", { name: "Points" })).toHaveAttribute(
      "aria-sort",
      "ascending"
    );
    expect(screen.getByRole("columnheader", { name: "Title" })).not.toHaveAttribute("aria-sort");
  });

  it("exposes the sort state to assistive tech via aria-sort on the active column only", async () => {
    const user = userEvent.setup();
    renderTable();

    const titleHeader = screen.getByRole("columnheader", { name: "Title" });
    expect(titleHeader).not.toHaveAttribute("aria-sort");

    await user.click(screen.getByRole("button", { name: "Title" }));
    expect(titleHeader).toHaveAttribute("aria-sort", "ascending");

    await user.click(screen.getByRole("button", { name: "Title" }));
    expect(titleHeader).toHaveAttribute("aria-sort", "descending");
    expect(screen.getByRole("columnheader", { name: "Assignee" })).not.toHaveAttribute("aria-sort");
  });

  it("is keyboard operable — sort controls are focusable buttons", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.tab();
    expect(screen.getByRole("button", { name: "Title" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(titleColumn()[0]).toBe("Fix the drag handle");
  });

  it("renders no sort control for a column without a sortValue", () => {
    renderTable();

    expect(screen.queryByRole("button", { name: "Assignee" })).not.toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Assignee" })).toBeInTheDocument();
  });

  it("shows placeholder rows while loading, and no data", () => {
    renderTable({ isLoading: true, data: rows });

    expect(screen.getAllByRole("row")).toHaveLength(6); // header + 5 skeleton rows
    expect(screen.queryByText("Write the sprint spec")).not.toBeInTheDocument();
  });

  it("shows the empty message when there is no data and it is not loading", () => {
    renderTable({ data: [], emptyMessage: "No sprint tasks yet" });

    expect(screen.getByText("No sprint tasks yet")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(2); // header + the empty-state row
  });
});
