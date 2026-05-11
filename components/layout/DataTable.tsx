import type { ReactNode } from "react";
import GlassCard from "@/components/ui/GlassCard";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  keyExtractor: (row: T) => string;
}

export default function DataTable<T>({
  columns,
  data,
  loading,
  emptyIcon,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
  keyExtractor,
}: DataTableProps<T>) {
  return (
    <GlassCard padding="p-0" className="overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : data.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "rgba(237,237,237,0.35)", width: col.width }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3.5 text-sm text-[rgba(237,237,237,0.8)]">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
