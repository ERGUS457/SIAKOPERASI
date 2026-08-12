"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExportButtons } from "@/components/export-buttons";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function ArusKasClient({
  operasiMasuk,
  operasiKeluar,
  investasiMasuk,
  investasiKeluar,
  pendanaanMasuk,
  pendanaanKeluar,
  kasAwal,
  initialParams,
}: {
  operasiMasuk: any[];
  operasiKeluar: any[];
  investasiMasuk: any[];
  investasiKeluar: any[];
  pendanaanMasuk: any[];
  pendanaanKeluar: any[];
  kasAwal: number;
  initialParams: { startDate?: string; endDate?: string };
}) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(initialParams.startDate || "");
  const [endDate, setEndDate] = useState(initialParams.endDate || "");

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    router.push(`/dashboard/laporan/arus-kas?${params.toString()}`);
  };

  const totalOperasiMasuk = operasiMasuk.reduce((s, a) => s + a.saldo, 0);
  const totalOperasiKeluar = operasiKeluar.reduce((s, a) => s + a.saldo, 0);
  const netOperasi = totalOperasiMasuk - totalOperasiKeluar;

  const totalInvestasiMasuk = investasiMasuk.reduce((s, a) => s + a.saldo, 0);
  const totalInvestasiKeluar = investasiKeluar.reduce((s, a) => s + a.saldo, 0);
  const netInvestasi = totalInvestasiMasuk - totalInvestasiKeluar;

  const totalPendanaanMasuk = pendanaanMasuk.reduce((s, a) => s + a.saldo, 0);
  const totalPendanaanKeluar = pendanaanKeluar.reduce((s, a) => s + a.saldo, 0);
  const netPendanaan = totalPendanaanMasuk - totalPendanaanKeluar;

  const netPerubahan = netOperasi + netInvestasi + netPendanaan;
  const kasAkhir = kasAwal + netPerubahan;

  const exportSections = [
    {
      title: "I. Arus Kas dari Aktivitas Operasi",
      headers: ["Keterangan", "Jumlah"],
      rows: [
        ...operasiMasuk.map(a => [a.kodeAkun + " - " + a.namaAkun, formatRupiah(a.saldo)]),
        operasiMasuk.length ? ["Jumlah Penerimaan Operasi", formatRupiah(totalOperasiMasuk)] : [],
        ...operasiKeluar.map(a => ["(" + a.kodeAkun + ") " + a.namaAkun, "(" + formatRupiah(a.saldo) + ")"]),
        operasiKeluar.length ? ["Jumlah Pengeluaran Operasi", "(" + formatRupiah(totalOperasiKeluar) + ")"] : [],
        ["Net Arus Kas Operasi", formatRupiah(netOperasi)],
      ].filter(r => r.length > 0) as string[][]
    },
    {
      title: "II. Arus Kas dari Aktivitas Investasi",
      headers: ["Keterangan", "Jumlah"],
      rows: [
        ...(investasiMasuk.length === 0 && investasiKeluar.length === 0
          ? [["Tidak ada aktivitas investasi.", "-"]]
          : [
            ...investasiMasuk.map(a => [a.kodeAkun + " - " + a.namaAkun, formatRupiah(a.saldo)]),
            ...investasiKeluar.map(a => ["(" + a.kodeAkun + ") " + a.namaAkun, "(" + formatRupiah(a.saldo) + ")"]),
          ]),
        ["Net Arus Kas Investasi", formatRupiah(netInvestasi)],
      ]
    },
    {
      title: "III. Arus Kas dari Aktivitas Pendanaan",
      headers: ["Keterangan", "Jumlah"],
      rows: [
        ...pendanaanMasuk.map(a => [a.kodeAkun + " - " + a.namaAkun, formatRupiah(a.saldo)]),
        ...pendanaanKeluar.map(a => ["(" + a.kodeAkun + ") " + a.namaAkun, "(" + formatRupiah(a.saldo) + ")"]),
        ["Net Arus Kas Pendanaan", formatRupiah(netPendanaan)],
        ["", ""],
        ["Net Kenaikan / (Penurunan) Kas", formatRupiah(netPerubahan)],
        ["Saldo Kas Awal Periode", formatRupiah(kasAwal)],
        ["SALDO KAS AKHIR PERIODE", formatRupiah(kasAkhir)],
      ]
    }
  ];

  const renderSection = (title: string, masuk: any[], keluar: any[], net: number, netLabel: string) => (
    <div className="space-y-3">
      <h3 className="text-base font-semibold border-b pb-2">{title}</h3>
      <Table>
        <TableBody>
          {masuk.map(a => (
            <TableRow key={a.id + "-m"}>
              <TableCell className="pl-4">{a.kodeAkun} - {a.namaAkun}</TableCell>
              <TableCell className="text-right text-green-600 font-medium">{formatRupiah(a.saldo)}</TableCell>
            </TableRow>
          ))}
          {keluar.map(a => (
            <TableRow key={a.id + "-k"}>
              <TableCell className="pl-4">({a.kodeAkun}) {a.namaAkun}</TableCell>
              <TableCell className="text-right text-red-600 font-medium">({formatRupiah(a.saldo)})</TableCell>
            </TableRow>
          ))}
          {masuk.length === 0 && keluar.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground italic">Tidak ada aktivitas.</TableCell>
            </TableRow>
          )}
          <TableRow className="bg-muted/50 font-bold">
            <TableCell>{netLabel}</TableCell>
            <TableCell className={`text-right ${net >= 0 ? "text-green-700" : "text-red-700"}`}>
              {formatRupiah(net)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter Tanggal</CardTitle>
            <ExportButtons config={{
              namaLaporan: "Laporan Arus Kas",
              filename: "Laporan_Arus_Kas",
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Net Arus Operasi", value: netOperasi, icon: Activity },
          { label: "Net Arus Investasi", value: netInvestasi, icon: TrendingDown },
          { label: "Net Arus Pendanaan", value: netPendanaan, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`text-xl font-bold ${value >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatRupiah(value)}
                </p>
              </div>
              <Icon className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 space-y-8">
          {renderSection(
            "I. Arus Kas dari Aktivitas Operasi",
            operasiMasuk, operasiKeluar, netOperasi, "Net Arus Kas Operasi"
          )}
          {renderSection(
            "II. Arus Kas dari Aktivitas Investasi",
            investasiMasuk, investasiKeluar, netInvestasi, "Net Arus Kas Investasi"
          )}
          {renderSection(
            "III. Arus Kas dari Aktivitas Pendanaan",
            pendanaanMasuk, pendanaanKeluar, netPendanaan, "Net Arus Kas Pendanaan"
          )}
          <div className="border-t-2 pt-4 space-y-2">
            <div className="flex justify-between font-semibold">
              <span>Net Kenaikan / (Penurunan) Kas</span>
              <span className={netPerubahan >= 0 ? "text-green-700" : "text-red-700"}>{formatRupiah(netPerubahan)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Saldo Kas Awal Periode</span>
              <span>{formatRupiah(kasAwal)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold p-3 bg-primary text-primary-foreground rounded-lg mt-2">
              <span>Saldo Kas Akhir Periode</span>
              <span>{formatRupiah(kasAkhir)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
