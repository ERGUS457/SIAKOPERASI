"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { formatRupiah } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LaporanSimpananClient({ data }: { data: any[] }) {
  const columns = [
    {
      accessorKey: "anggota.nomorAnggota",
      header: "No. Anggota",
    },
    {
      accessorKey: "anggota.nama",
      header: "Nama Anggota",
    },
    {
      accessorKey: "simpananPokok",
      header: "Simpanan Pokok",
      cell: (item: any) => formatRupiah(item.simpananPokok),
    },
    {
      accessorKey: "simpananWajib",
      header: "Simpanan Wajib",
      cell: (item: any) => formatRupiah(item.simpananWajib),
    },
    {
      accessorKey: "simpananSukarela",
      header: "Simpanan Sukarela",
      cell: (item: any) => formatRupiah(item.simpananSukarela),
    },
    {
      accessorKey: "tambahanModal",
      header: "Tambahan Modal",
      cell: (item: any) => formatRupiah(item.tambahanModal),
    },
    {
      accessorKey: "total",
      header: "Total Simpanan",
      cell: (item: any) => {
        const total = item.simpananPokok + item.simpananWajib + item.simpananSukarela + item.simpanan + item.simpanan1 + item.simpanan2 + item.tambahanModal;
        return <span className="font-bold">{formatRupiah(total)}</span>;
      }
    }
  ];

  const totalKeseluruhan = useMemo(() => {
    return data.reduce((acc, item) => {
      return acc + item.simpananPokok + item.simpananWajib + item.simpananSukarela + item.simpanan + item.simpanan1 + item.simpanan2 + item.tambahanModal;
    }, 0);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Simpanan Keseluruhan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalKeseluruhan)}</div>
            <p className="text-xs text-muted-foreground">Dari {data.length} anggota aktif</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
        <h3 className="font-semibold text-lg mb-4">Rincian Simpanan per Anggota</h3>
        <p className="text-sm text-muted-foreground mb-4">Gunakan kotak pencarian untuk memfilter data berdasarkan nama anggota. Laporan dapat diekspor ke PDF dan Excel.</p>
        <DataTable 
          columns={columns} 
          data={data} 
          searchKey="anggota.nama" 
          searchPlaceholder="Cari nama anggota..."
          exportFilename="Laporan_Simpanan_Usaha"
        />
      </div>
    </div>
  );
}
