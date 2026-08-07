"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NeracaSaldoClient({
  neracaSaldo,
  initialParams,
}: {
  neracaSaldo: any[];
  initialParams: { startDate?: string; endDate?: string };
}) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(initialParams.startDate || "");
  const [endDate, setEndDate] = useState(initialParams.endDate || "");

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    router.push(`/dashboard/laporan/neraca-saldo?${params.toString()}`);
  };

  const totalDebit = neracaSaldo.reduce((sum, item) => sum + item.debit, 0);
  const totalKredit = neracaSaldo.reduce((sum, item) => sum + item.kredit, 0);

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
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Akun</TableHead>
                  <TableHead>Nama Akun</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Kredit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {neracaSaldo.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Tidak ada data.
                    </TableCell>
                  </TableRow>
                ) : (
                  neracaSaldo.map((akun) => (
                    <TableRow key={akun.id}>
                      <TableCell className="font-medium">
                        {akun.kodeAkun}
                      </TableCell>
                      <TableCell>{akun.namaAkun}</TableCell>
                      <TableCell className="text-right">
                        {akun.debit > 0 ? formatRupiah(akun.debit) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {akun.kredit > 0 ? formatRupiah(akun.kredit) : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={2} className="text-right">
                    Total
                  </TableCell>
                  <TableCell className="text-right">
                    {formatRupiah(totalDebit)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatRupiah(totalKredit)}
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
