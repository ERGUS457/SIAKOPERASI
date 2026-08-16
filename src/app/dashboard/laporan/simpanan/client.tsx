"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { formatRupiah } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButtons } from "@/components/export-buttons";

function calcTotal(item: any): number {
  return (
    (item.simpananPokok || 0) +
    (item.simpananWajib || 0) +
    (item.simpananSukarela || 0) +
    (item.simpanan || 0) +
    (item.simpanan1 || 0) +
    (item.simpanan2 || 0) +
    (item.tambahanModal || 0)
  );
}

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
      cell: (item: any) => formatRupiah(item.simpananPokok || 0),
    },
    {
      accessorKey: "simpananWajib",
      header: "Simpanan Wajib",
      cell: (item: any) => formatRupiah(item.simpananWajib || 0),
    },
    {
      accessorKey: "simpananSukarela",
      header: "Simpanan Sukarela",
      cell: (item: any) => formatRupiah(item.simpananSukarela || 0),
    },
    {
      accessorKey: "tambahanModal",
      header: "Tambahan Modal",
      cell: (item: any) => formatRupiah(item.tambahanModal || 0),
    },
    {
      accessorKey: "total",
      header: "Total Simpanan",
      cell: (item: any) => formatRupiah(calcTotal(item)),
    },
  ];

  const totalKeseluruhan = useMemo(() => {
    return data.reduce((acc, item) => acc + calcTotal(item), 0);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Card className="w-full sm:w-auto min-w-[220px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Simpanan Keseluruhan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalKeseluruhan)}</div>
            <p className="text-xs text-muted-foreground">Dari {data.length} anggota aktif</p>
          </CardContent>
        </Card>

        <ExportButtons
          label="Lihat Laporan PDF"
          config={{
            namaLaporan: "Laporan Simpanan Usaha",
            filename: "Laporan_Simpanan_Usaha",
            columns,
            data,
          }}
        />
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
        <h3 className="font-semibold text-lg mb-4">Rincian Simpanan per Anggota</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Gunakan kotak pencarian untuk memfilter data berdasarkan nama anggota.
        </p>
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
