"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { ExportButtons } from "./export-buttons";

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: string;
    cell?: (item: T) => React.ReactNode;
  }[];
  searchKey?: string;
  searchPlaceholder?: string;
  onAdd?: () => void;
  addLabel?: string;
  exportFilename?: string;
}

export function DataTable<T>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Cari...",
  onAdd,
  addLabel = "Tambah Data",
  exportFilename = "Data",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Filter data
  const filteredData = data.filter((item) => {
    if (!search || !searchKey) return true;
    
    // Resolve nested keys like 'anggota.nama'
    const keys = (searchKey as string).split('.');
    let val: any = item;
    for (const key of keys) {
      if (val === null || val === undefined) break;
      val = val[key];
    }

    if (typeof val === "string") {
      return val.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row w-full flex-1 items-stretch sm:items-center gap-2">
          {searchKey && (
            <div className="relative w-full max-w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset page on search
                }}
                className="pl-9 w-full bg-background h-9 text-sm"
              />
            </div>
          )}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <ExportButtons
              config={{
                namaLaporan: exportFilename.replace(/_/g, " "),
                filename: exportFilename,
                columns: columns as any,
                data: filteredData as any[],
              }}
            />
          </div>
        </div>
        
        {onAdd && (
          <Button onClick={onAdd} className="w-full sm:w-auto h-9 text-sm">
            <Plus className="mr-2 h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, index) => (
                  <TableHead key={index} className="whitespace-nowrap">{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((col, colIndex) => (
                      <TableCell key={colIndex} className="whitespace-nowrap">
                        {col.cell
                          ? col.cell(item)
                          : ((col.accessorKey as string).split('.').reduce((obj: any, key) => obj?.[key], item) as React.ReactNode)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Tidak ada data ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1">
        <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          Menampilkan {paginatedData.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} -{" "}
          {Math.min(page * itemsPerPage, filteredData.length)} dari{" "}
          {filteredData.length} data
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-8 text-xs px-2.5"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <div className="text-xs sm:text-sm font-medium">
            Halaman {page} dari {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-8 text-xs px-2.5"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
