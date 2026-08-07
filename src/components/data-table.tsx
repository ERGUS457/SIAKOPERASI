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

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: keyof T | string;
    cell?: (item: T) => React.ReactNode;
  }[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  onAdd?: () => void;
  addLabel?: string;
}

export function DataTable<T>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Cari...",
  onAdd,
  addLabel = "Tambah Data",
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {searchKey && (
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset page on search
              }}
              className="pl-8"
            />
          </div>
        )}
        
        {onAdd && (
          <Button onClick={onAdd} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, index) => (
                <TableHead key={index}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex}>
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
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
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <div className="text-sm font-medium">
            Halaman {page} dari {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
