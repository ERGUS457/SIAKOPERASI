"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExportButtons } from "@/components/export-buttons";

export default function PerubahanModalClient({
  modalData,
  labaBersih,
  initialParams,
}: {
  modalData: any[];
  labaBersih: number;
  initialParams: { startDate?: string; endDate?: string };
}) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(initialParams.startDate || "");
  const [endDate, setEndDate] = useState(initialParams.endDate || "");

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    router.push(`/dashboard/laporan/perubahan-modal?${params.toString()}`);
  };

  const totalSaldoAkhir = modalData.reduce((sum, item) => sum + item.saldoAkhir, 0) + labaBersih;

  const exportSections = [{
    title: "Perubahan Modal",
    headers: ["Akun Modal", "Penambahan", "Pengurangan", "Saldo Akhir"],
    rows: [
      ...modalData.map(m => [
        m.kodeAkun + " - " + m.namaAkun,
        formatRupiah(m.penambahan),
        formatRupiah(m.pengurangan),
        formatRupiah(m.saldoAkhir),
      ]),
      ["Laba / Rugi Bersih Periode Berjalan", formatRupiah(labaBersih), "-", formatRupiah(labaBersih)],
      ["TOTAL MODAL AKHIR", "", "", formatRupiah(totalSaldoAkhir)],
    ]
  }];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter Tanggal</CardTitle>
            <ExportButtons config={{
              namaLaporan: "Laporan Perubahan Modal",
              filename: "Laporan_Perubahan_Modal",
              startDate,
              endDate,
              sections: exportSections,
            }} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Dari Tanggal</label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Sampai Tanggal</label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <Button onClick={handleFilter}>Tampilkan</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rincian Perubahan Modal</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Akun Modal</TableHead>
                  <TableHead className="text-right">Penambahan</TableHead>
                  <TableHead className="text-right">Pengurangan</TableHead>
                  <TableHead className="text-right">Saldo Akhir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modalData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Tidak ada data akun modal.
                    </TableCell>
                  </TableRow>
                ) : (
                  modalData.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">
                        {m.kodeAkun} - {m.namaAkun}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {m.penambahan > 0 ? formatRupiah(m.penambahan) : "-"}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {m.pengurangan > 0 ? formatRupiah(m.pengurangan) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatRupiah(m.saldoAkhir)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {/* Laba/Rugi Berjalan */}
                <TableRow className="bg-blue-50 dark:bg-blue-950/20">
                  <TableCell className="font-medium">Laba / Rugi Bersih Periode Berjalan</TableCell>
                  <TableCell className="text-right text-green-600">
                    {labaBersih >= 0 ? formatRupiah(labaBersih) : "-"}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {labaBersih < 0 ? formatRupiah(Math.abs(labaBersih)) : "-"}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${labaBersih >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {formatRupiah(labaBersih)}
                  </TableCell>
                </TableRow>
                {/* Total */}
                <TableRow className="bg-muted/50 font-bold text-base">
                  <TableCell>TOTAL MODAL AKHIR PERIODE</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right text-primary">
                    {formatRupiah(totalSaldoAkhir)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
