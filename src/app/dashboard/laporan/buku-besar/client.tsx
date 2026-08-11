"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah, formatTanggalSingkat } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExportButtons } from "@/components/export-buttons";
import { useMemo } from "react";

export default function BukuBesarClient({
  akunList,
  detailJurnal,
  akunSelected,
  saldoAwal,
  initialParams,
}: {
  akunList: any[];
  detailJurnal: any[];
  akunSelected: any;
  saldoAwal: number;
  initialParams: { akunId?: string; startDate?: string; endDate?: string };
}) {
  const router = useRouter();
  const [akunId, setAkunId] = useState(initialParams.akunId || "");
  const [startDate, setStartDate] = useState(initialParams.startDate || "");
  const [endDate, setEndDate] = useState(initialParams.endDate || "");

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (akunId) params.set("akunId", akunId);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    router.push(`/dashboard/laporan/buku-besar?${params.toString()}`);
  };

  const { processedData, exportData, totalDebit, totalKredit, finalSaldo } = useMemo(() => {
    let currentSaldo = saldoAwal;
    let totalDeb = 0;
    let totalKre = 0;

    const data = detailJurnal.map((dj) => {
      if (akunSelected?.saldoNormal === "DEBIT") {
        if (dj.posisi === "DEBIT") currentSaldo += dj.nominal;
        else currentSaldo -= dj.nominal;
      } else {
        if (dj.posisi === "KREDIT") currentSaldo += dj.nominal;
        else currentSaldo -= dj.nominal;
      }

      if (dj.posisi === "DEBIT") totalDeb += dj.nominal;
      if (dj.posisi === "KREDIT") totalKre += dj.nominal;

      return {
        ...dj,
        runningSaldo: currentSaldo,
      };
    });

    const expData = [
      {
        Tanggal: "-",
        "No. Transaksi": "-",
        Keterangan: "Saldo Awal",
        Debit: 0,
        Kredit: 0,
        Saldo: saldoAwal,
      },
      ...data.map((dj) => ({
        Tanggal: formatTanggalSingkat(dj.transaksi.tanggal),
        "No. Transaksi": dj.transaksi.nomorTransaksi,
        Keterangan: dj.keterangan || dj.transaksi.keterangan || "-",
        Debit: dj.posisi === "DEBIT" ? dj.nominal : 0,
        Kredit: dj.posisi === "KREDIT" ? dj.nominal : 0,
        Saldo: dj.runningSaldo,
      })),
      {
        Tanggal: "-",
        "No. Transaksi": "-",
        Keterangan: "Saldo Akhir",
        Debit: totalDeb,
        Kredit: totalKre,
        Saldo: currentSaldo,
      },
    ];

    return {
      processedData: data,
      exportData: expData,
      totalDebit: totalDeb,
      totalKredit: totalKre,
      finalSaldo: currentSaldo,
    };
  }, [detailJurnal, saldoAwal, akunSelected]);

  const exportColumns = [
    { header: "Tanggal", accessorKey: "Tanggal" },
    { header: "No. Transaksi", accessorKey: "No. Transaksi" },
    { header: "Keterangan", accessorKey: "Keterangan" },
    { header: "Debit", accessorKey: "Debit", cell: (item: any) => formatRupiah(item.Debit) },
    { header: "Kredit", accessorKey: "Kredit", cell: (item: any) => formatRupiah(item.Kredit) },
    { header: "Saldo", accessorKey: "Saldo", cell: (item: any) => formatRupiah(item.Saldo) }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Buku Besar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Akun</label>
            <Combobox
              options={akunList.map((akun) => ({
                label: `${akun.kodeAkun} - ${akun.namaAkun}`,
                value: akun.id,
              }))}
              value={akunId}
              onChange={setAkunId}
              placeholder="Pilih Akun..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Dari Tanggal</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
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

      {akunSelected && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {akunSelected.kodeAkun} - {akunSelected.namaAkun}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Saldo Normal: {akunSelected.saldoNormal}
              </p>
            </div>
            <ExportButtons 
              data={exportData}
              columns={exportColumns}
              filename={`Buku_Besar_${akunSelected.kodeAkun}`} 
            />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>No. Transaksi</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Kredit</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell colSpan={3}>Saldo Awal</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">
                      {formatRupiah(saldoAwal)}
                    </TableCell>
                  </TableRow>
                  {processedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Tidak ada transaksi.
                      </TableCell>
                    </TableRow>
                  ) : (
                    processedData.map((dj) => (
                      <TableRow key={dj.id}>
                        <TableCell>
                          {formatTanggalSingkat(dj.transaksi.tanggal)}
                        </TableCell>
                        <TableCell>{dj.transaksi.nomorTransaksi}</TableCell>
                        <TableCell>
                          {dj.keterangan || dj.transaksi.keterangan || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {dj.posisi === "DEBIT"
                            ? formatRupiah(dj.nominal)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {dj.posisi === "KREDIT"
                            ? formatRupiah(dj.nominal)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatRupiah(dj.runningSaldo)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {processedData.length > 0 && (
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={3} className="text-right">
                        Saldo Akhir
                      </TableCell>
                      <TableCell className="text-right">
                        {formatRupiah(totalDebit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatRupiah(totalKredit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatRupiah(finalSaldo)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
