import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ZONES, type Zone } from "@/lib/site";

const helper = createColumnHelper<Zone>();

export function ZoneTable() {
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const columns = useMemo(
    () => [
      helper.accessor("name", {
        header: "Zone",
        cell: (info) => (
          <Link
            to="/zones/$slug"
            params={{ slug: info.row.original.slug }}
            className="font-medium text-maroon hover:text-burgundy"
          >
            {info.getValue()}
          </Link>
        ),
      }),
      helper.accessor("coverage", { header: "Coverage" }),
      helper.accessor("typical", { header: "Typical work" }),
      helper.accessor("logistics", { header: "Logistics" }),
    ],
    [],
  );

  const table = useReactTable({
    data: ZONES,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto border border-line rounded-sm">
      <table className="w-full min-w-[640px] text-sm text-left">
        <thead className="bg-stone text-[11px] uppercase tracking-[0.16em] text-muted">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="px-4 py-3 font-medium">
                  {h.isPlaceholder ? null : (
                    <button
                      type="button"
                      className="uppercase tracking-[0.16em]"
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-line bg-cream">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-4 align-top text-ink/80">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
