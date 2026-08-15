import { useMemo, useState, type ReactNode } from "react";
import { Skeleton } from "./Skeleton";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string | number;
  caption: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

type SortDirection = "asc" | "desc";

export function DataTable<T>({
  columns,
  data,
  getRowId,
  caption,
  isLoading = false,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedData = useMemo(() => {
    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sortValue) return data;

    const direction = sortDirection === "asc" ? 1 : -1;
    return [...data].sort((a, b) => {
      const aValue = column.sortValue!(a);
      const bValue = column.sortValue!(b);
      if (aValue < bValue) return -direction;
      if (aValue > bValue) return direction;
      return 0;
    });
  }, [data, columns, sortKey, sortDirection]);

  function handleSort(column: DataTableColumn<T>) {
    if (!column.sortValue) return;
    if (sortKey === column.key) {
      setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column.key);
      setSortDirection("asc");
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-outline-variant bg-surface-bright">
      <table className="w-full min-w-[480px] border-collapse text-left text-body-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low">
            {columns.map((column) => {
              const isSortable = Boolean(column.sortValue);
              const isActive = sortKey === column.key;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={isActive ? (sortDirection === "asc" ? "ascending" : "descending") : undefined}
                  className={[
                    "p-md text-label-md uppercase tracking-widest text-on-surface-variant",
                    column.className ?? "",
                  ].join(" ")}
                >
                  {isSortable ? (
                    <button
                      onClick={() => handleSort(column)}
                      className="inline-flex items-center gap-xs transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {column.header}
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                        {isActive ? (sortDirection === "asc" ? "arrow_upward" : "arrow_downward") : "unfold_more"}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b border-outline-variant last:border-0">
                {columns.map((column) => (
                  <td key={column.key} className="p-md">
                    <Skeleton className="h-4 w-full max-w-[160px]" />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading && sortedData.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="p-lg text-center text-on-surface-variant">
                {emptyMessage}
              </td>
            </tr>
          )}

          {!isLoading &&
            sortedData.map((row) => (
              <tr
                key={getRowId(row)}
                className="border-b border-outline-variant transition-colors last:border-0 hover:bg-surface-container-low"
              >
                {columns.map((column) => (
                  <td key={column.key} className={["p-md text-on-surface", column.className ?? ""].join(" ")}>
                    {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
