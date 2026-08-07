"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LabaRugiClient({
  pendapatan,
  beban,
  initialParams,
}: {
  pendapatan: any[];
  beban: any[];
  initialParams: { startDate?: string; endDate?: string };
}) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(initialParams.startDate || "");
  const [endDate, setEndDate] = useState(initialParams.endDate || "");

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    router.push(`/dashboard/laporan/laba-rugi?${params.toString()}`);
  };

  const totalPendapatan = pendapatan.reduce((sum, item) => sum + item.saldo, 0);
  const totalBeban = beban.reduce((sum, item) => sum + item.saldo, 0);
  const labaBersih = totalPendapatan - totalBeban;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Tanggal</CardTitle>
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

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Pendapatan</h3>
            <Table>
              <TableBody>
                {pendapatan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground italic">
                      Tidak ada pendapatan.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendapatan.map((akun) => (
                    <TableRow key={akun.id}>
                      <TableCell>
                        {akun.kodeAkun} - {akun.namaAkun}
                      </TableCell>
                      <TableCell className="text-right w-[200px]">
                        {formatRupiah(akun.saldo)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="font-bold bg-muted/50">
                  <TableCell>Total Pendapatan</TableCell>
                  <TableCell className="text-right">
                    {formatRupiah(totalPendapatan)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Beban</h3>
            <Table>
              <TableBody>
                {beban.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground italic">
                      Tidak ada beban.
                    </TableCell>
                  </TableRow>
                ) : (
                  beban.map((akun) => (
                    <TableRow key={akun.id}>
                      <TableCell>
                        {akun.kodeAkun} - {akun.namaAkun}
                      </TableCell>
                      <TableCell className="text-right w-[200px]">
                        {formatRupiah(akun.saldo)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="font-bold bg-muted/50">
                  <TableCell>Total Beban</TableCell>
                  <TableCell className="text-right">
                    {formatRupiah(totalBeban)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded-lg">
            <h3 className="text-xl font-bold">Laba / Rugi Bersih</h3>
            <span className="text-xl font-bold">{formatRupiah(labaBersih)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
