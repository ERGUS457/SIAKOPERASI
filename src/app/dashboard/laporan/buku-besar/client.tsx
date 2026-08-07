"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah, formatTanggalSingkat } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  let currentSaldo = saldoAwal;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Buku Besar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Akun</label>
            <Select value={akunId} onValueChange={setAkunId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Akun..." />
              </SelectTrigger>
              <SelectContent>
                {akunList.map((akun) => (
                  <SelectItem key={akun.id} value={akun.id}>
                    {akun.kodeAkun} - {akun.namaAkun}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <CardHeader>
            <CardTitle>
              {akunSelected.kodeAkun} - {akunSelected.namaAkun}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Saldo Normal: {akunSelected.saldoNormal}
            </p>
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
                  {detailJurnal.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Tidak ada transaksi.
                      </TableCell>
                    </TableRow>
                  ) : (
                    detailJurnal.map((dj) => {
                      if (akunSelected.saldoNormal === "DEBIT") {
                        if (dj.posisi === "DEBIT") currentSaldo += dj.nominal;
                        else currentSaldo -= dj.nominal;
                      } else {
                        if (dj.posisi === "KREDIT") currentSaldo += dj.nominal;
                        else currentSaldo -= dj.nominal;
                      }

                      return (
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
                            {formatRupiah(currentSaldo)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                  {detailJurnal.length > 0 && (
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={3} className="text-right">
                        Saldo Akhir
                      </TableCell>
                      <TableCell className="text-right">
                        {formatRupiah(
                          detailJurnal.reduce(
                            (acc, curr) => acc + (curr.posisi === "DEBIT" ? curr.nominal : 0),
                            0
                          )
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatRupiah(
                          detailJurnal.reduce(
                            (acc, curr) => acc + (curr.posisi === "KREDIT" ? curr.nominal : 0),
                            0
                          )
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatRupiah(currentSaldo)}
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
