"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { formatRupiah } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Filter, RotateCcw, FileText, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ExportButtons } from "@/components/export-buttons";

function getJenisJurnalBadge(jenis: string) {
  switch (jenis) {
    case "PEMBELIAN_KREDIT":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Pembelian Kredit</Badge>;
    case "PENJUALAN":
      return <Badge className="bg-emerald-500 hover:bg-emerald-600">Penjualan</Badge>;
    case "PENERIMAAN_KAS":
      return <Badge className="bg-amber-500 hover:bg-amber-600">Penerimaan Kas</Badge>;
    case "PENGELUARAN_KAS":
      return <Badge className="bg-rose-500 hover:bg-rose-600">Pengeluaran Kas</Badge>;
    case "UMUM":
    default:
      return <Badge className="bg-slate-500 hover:bg-slate-600">Jurnal Umum</Badge>;
  }
}

export default function JurnalClient({ data }: { data: any[] }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [jenisJurnalFilter, setJenisJurnalFilter] = useState("ALL");

  // Filter data based on date range and jenisJurnal
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const itemDate = new Date(item.tanggal).toISOString().split("T")[0];

      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      if (jenisJurnalFilter !== "ALL" && item.jenisJurnal !== jenisJurnalFilter) return false;

      return true;
    });
  }, [data, startDate, endDate, jenisJurnalFilter]);

  // Calculate summary metrics
  const totalNominal = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + (item.totalNominal || 0), 0);
  }, [filteredData]);

  const resetFilter = () => {
    setStartDate("");
    setEndDate("");
    setJenisJurnalFilter("ALL");
  };

  const exportSections = useMemo(() => {
    return [
      {
        title: "Riwayat Jurnal Transaksi",
        headers: ["No. Transaksi", "Tanggal", "Jenis Jurnal", "Kontak / Sumber", "Keterangan", "Total (Rp)"],
        rows: [
          ...filteredData.map((item) => [
            item.nomorTransaksi,
            format(new Date(item.tanggal), "dd/MM/yyyy"),
            item.jenisJurnal,
            item.sumber || "-",
            item.keterangan || "-",
            formatRupiah(item.totalNominal),
          ]),
          ["", "", "", "", "TOTAL NOMINAL", formatRupiah(totalNominal)],
        ],
      },
    ];
  }, [filteredData, totalNominal]);

  const columns = [
    {
      accessorKey: "nomorTransaksi",
      header: "No. Transaksi",
    },
    {
      accessorKey: "tanggal",
      header: "Tanggal",
      cell: (item: any) => {
        return format(new Date(item.tanggal), "dd MMM yyyy", { locale: id });
      },
    },
    {
      accessorKey: "jenisJurnal",
      header: "Jenis Jurnal",
      cell: (item: any) => {
        return getJenisJurnalBadge(item.jenisJurnal);
      },
    },
    {
      accessorKey: "sumber",
      header: "Kontak / Sumber",
    },
    {
      accessorKey: "keterangan",
      header: "Keterangan",
    },
    {
      accessorKey: "totalNominal",
      header: "Total",
      cell: (item: any) => {
        return <span className="font-semibold text-primary">{formatRupiah(item.totalNominal)}</span>;
      },
    },
    {
      accessorKey: "actions",
      header: "Detail",
      cell: (item: any) => {
        const trx = item;
        const debit = trx.detailJurnal.filter((d: any) => d.posisi === "DEBIT");
        const kredit = trx.detailJurnal.filter((d: any) => d.posisi === "KREDIT");

        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                Detail Jurnal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Detail Jurnal: {trx.nomorTransaksi}</DialogTitle>
                <DialogDescription>
                  {format(new Date(trx.tanggal), "dd MMMM yyyy", { locale: id })} | {trx.keterangan || "-"}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] mt-4">
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 text-left">Kode Akun</th>
                        <th className="p-3 text-left">Nama Akun</th>
                        <th className="p-3 text-right">Debit</th>
                        <th className="p-3 text-right">Kredit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debit.map((d: any) => (
                        <tr key={d.id} className="border-t">
                          <td className="p-3 font-mono text-xs">{d.akun.kodeAkun}</td>
                          <td className="p-3">{d.akun.namaAkun}</td>
                          <td className="p-3 text-right font-medium text-emerald-600">{formatRupiah(d.nominal)}</td>
                          <td className="p-3 text-right text-muted-foreground">-</td>
                        </tr>
                      ))}
                      {kredit.map((k: any) => (
                        <tr key={k.id} className="border-t">
                          <td className="p-3 font-mono text-xs">{k.akun.kodeAkun}</td>
                          <td className="p-3 pl-8">{k.akun.namaAkun}</td>
                          <td className="p-3 text-right text-muted-foreground">-</td>
                          <td className="p-3 text-right font-medium text-rose-600">{formatRupiah(k.nominal)}</td>
                        </tr>
                      ))}
                      <tr className="border-t bg-muted/30 font-semibold">
                        <td className="p-3" colSpan={2}>Total Keseimbangan</td>
                        <td className="p-3 text-right text-emerald-600">{formatRupiah(trx.totalNominal)}</td>
                        <td className="p-3 text-right text-rose-600">{formatRupiah(trx.totalNominal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Card */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filter Laporan Jurnal Transaksi
            </CardTitle>
            <ExportButtons
              config={{
                namaLaporan: "Laporan Riwayat Jurnal Transaksi",
                filename: "Laporan_Jurnal_Transaksi",
                startDate,
                endDate,
                sections: exportSections,
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Dari Tanggal</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Sampai Tanggal</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Jenis Jurnal Transaksi</Label>
              <Select value={jenisJurnalFilter} onValueChange={setJenisJurnalFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Semua Jenis Jurnal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Jenis Jurnal</SelectItem>
                  <SelectItem value="PEMBELIAN_KREDIT">Pembelian Kredit</SelectItem>
                  <SelectItem value="PENJUALAN">Penjualan Kredit</SelectItem>
                  <SelectItem value="PENERIMAAN_KAS">Penerimaan Kas (BKM)</SelectItem>
                  <SelectItem value="PENGELUARAN_KAS">Pengeluaran Kas (BKK)</SelectItem>
                  <SelectItem value="UMUM">Jurnal Umum (Penyesuaian)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetFilter}
                className="h-9 w-full gap-1.5"
                disabled={!startDate && !endDate && jenisJurnalFilter === "ALL"}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Jumlah Transaksi Terfilter</p>
              <p className="text-2xl font-bold mt-1">{filteredData.length}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Volume Transaksi</p>
              <p className="text-2xl font-bold mt-1 text-primary">{formatRupiah(totalNominal)}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="nomorTransaksi"
        searchPlaceholder="Cari nomor transaksi..."
        exportFilename="Laporan_Jurnal_Transaksi"
      />
    </div>
  );
}
