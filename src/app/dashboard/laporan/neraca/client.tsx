"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExportButtons } from "@/components/export-buttons";

export default function NeracaClient({
  asetLancar,
  asetTetap,
  kewajibanPendek,
  kewajibanPanjang,
  modal,
  labaBersih,
  initialParams,
}: {
  asetLancar: any[];
  asetTetap: any[];
  kewajibanPendek: any[];
  kewajibanPanjang: any[];
  modal: any[];
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
    router.push(`/dashboard/laporan/neraca?${params.toString()}`);
  };

  const totalAsetLancar = asetLancar.reduce((sum, item) => sum + item.saldo, 0);
  const totalAsetTetap = asetTetap.reduce((sum, item) => sum + item.saldo, 0);
  const totalAset = totalAsetLancar + totalAsetTetap;

  const totalKewajibanPendek = kewajibanPendek.reduce((sum, item) => sum + item.saldo, 0);
  const totalKewajibanPanjang = kewajibanPanjang.reduce((sum, item) => sum + item.saldo, 0);
  const totalKewajiban = totalKewajibanPendek + totalKewajibanPanjang;

  const totalModalDetail = modal.reduce((sum, item) => sum + item.saldo, 0);
  const totalModal = totalModalDetail + labaBersih;

  const totalKewajibanModal = totalKewajiban + totalModal;

  const renderAkunRows = (akunList: any[]) => {
    if (akunList.length === 0) {
      return (
        <TableRow>
          <TableCell className="pl-8 text-muted-foreground italic">
            Tidak ada data.
          </TableCell>
          <TableCell></TableCell>
        </TableRow>
      );
    }
    return akunList.map((akun) => (
      <TableRow key={akun.id}>
        <TableCell className="pl-8">
          {akun.kodeAkun} - {akun.namaAkun}
        </TableCell>
        <TableCell className="text-right w-[200px]">
          {formatRupiah(akun.saldo)}
        </TableCell>
      </TableRow>
    ));
  };

  const exportSections = [
    {
      title: "ASET",
      headers: ["Keterangan", "Jumlah"],
      rows: [
        ["ASET LANCAR", ""],
        ...asetLancar.map(a => [a.kodeAkun + " - " + a.namaAkun, formatRupiah(a.saldo)]),
        ["Total Aset Lancar", formatRupiah(totalAsetLancar)],
        ["ASET TETAP", ""],
        ...asetTetap.map(a => [a.kodeAkun + " - " + a.namaAkun, formatRupiah(a.saldo)]),
        ["Total Aset Tetap", formatRupiah(totalAsetTetap)],
        ["TOTAL ASET", formatRupiah(totalAset)],
      ]
    },
    {
      title: "KEWAJIBAN & MODAL",
      headers: ["Keterangan", "Jumlah"],
      rows: [
        ["KEWAJIBAN JANGKA PENDEK", ""],
        ...kewajibanPendek.map(a => [a.kodeAkun + " - " + a.namaAkun, formatRupiah(a.saldo)]),
        ["Total Kewajiban Jangka Pendek", formatRupiah(totalKewajibanPendek)],
        ["KEWAJIBAN JANGKA PANJANG", ""],
        ...kewajibanPanjang.map(a => [a.kodeAkun + " - " + a.namaAkun, formatRupiah(a.saldo)]),
        ["Total Kewajiban Jangka Panjang", formatRupiah(totalKewajibanPanjang)],
        ["MODAL", ""],
        ...modal.map(a => [a.kodeAkun + " - " + a.namaAkun, formatRupiah(a.saldo)]),
        ["Laba / Rugi Berjalan", formatRupiah(labaBersih)],
        ["Total Modal", formatRupiah(totalModal)],
        ["TOTAL KEWAJIBAN & MODAL", formatRupiah(totalKewajibanModal)],
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter Tanggal</CardTitle>
            <ExportButtons config={{
              namaLaporan: "Neraca (Balance Sheet)",
              filename: "Neraca",
              startDate,
              endDate,
              sections: exportSections,
            }} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Dari Tanggal</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Sampai Tanggal</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button onClick={handleFilter}>Tampilkan</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom ASET */}
        <Card>
          <CardHeader>
            <CardTitle>Aset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-0">
            <div>
              <div className="px-6 py-2 bg-muted/30 font-semibold">Aset Lancar</div>
              <Table>
                <TableBody>
                  {renderAkunRows(asetLancar)}
                  <TableRow className="font-medium bg-muted/10">
                    <TableCell className="pl-8">Total Aset Lancar</TableCell>
                    <TableCell className="text-right">{formatRupiah(totalAsetLancar)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div>
              <div className="px-6 py-2 bg-muted/30 font-semibold">Aset Tetap</div>
              <Table>
                <TableBody>
                  {renderAkunRows(asetTetap)}
                  <TableRow className="font-medium bg-muted/10">
                    <TableCell className="pl-8">Total Aset Tetap</TableCell>
                    <TableCell className="text-right">{formatRupiah(totalAsetTetap)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="p-4 bg-primary text-primary-foreground rounded-b-lg flex justify-between items-center">
              <h3 className="font-bold text-lg">Total Aset</h3>
              <span className="font-bold text-lg">{formatRupiah(totalAset)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Kolom KEWAJIBAN & MODAL */}
        <Card>
          <CardHeader>
            <CardTitle>Kewajiban & Modal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-0">
            <div>
              <div className="px-6 py-2 bg-muted/30 font-semibold">Kewajiban Jangka Pendek</div>
              <Table>
                <TableBody>
                  {renderAkunRows(kewajibanPendek)}
                  <TableRow className="font-medium bg-muted/10">
                    <TableCell className="pl-8">Total Kew. Pendek</TableCell>
                    <TableCell className="text-right">{formatRupiah(totalKewajibanPendek)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div>
              <div className="px-6 py-2 bg-muted/30 font-semibold">Kewajiban Jangka Panjang</div>
              <Table>
                <TableBody>
                  {renderAkunRows(kewajibanPanjang)}
                  <TableRow className="font-medium bg-muted/10">
                    <TableCell className="pl-8">Total Kew. Panjang</TableCell>
                    <TableCell className="text-right">{formatRupiah(totalKewajibanPanjang)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div>
              <div className="px-6 py-2 bg-muted/30 font-semibold">Modal</div>
              <Table>
                <TableBody>
                  {renderAkunRows(modal)}
                  <TableRow>
                    <TableCell className="pl-8">Laba / Rugi Berjalan</TableCell>
                    <TableCell className="text-right">{formatRupiah(labaBersih)}</TableCell>
                  </TableRow>
                  <TableRow className="font-medium bg-muted/10">
                    <TableCell className="pl-8">Total Modal</TableCell>
                    <TableCell className="text-right">{formatRupiah(totalModal)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="p-4 bg-primary text-primary-foreground rounded-b-lg flex justify-between items-center">
              <h3 className="font-bold text-lg">Total Kewajiban & Modal</h3>
              <span className="font-bold text-lg">{formatRupiah(totalKewajibanModal)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
