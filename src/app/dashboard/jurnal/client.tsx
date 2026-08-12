"use client";

import { DataTable } from "@/components/data-table";
import { formatRupiah } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye } from "lucide-react";

function getJenisJurnalBadge(jenis: string) {
  switch (jenis) {
    case "PEMBELIAN_KREDIT":
      return <Badge className="bg-blue-500">Pembelian Kredit</Badge>;
    case "PENJUALAN":
      return <Badge className="bg-emerald-500">Penjualan</Badge>;
    case "PENERIMAAN_KAS":
      return <Badge className="bg-amber-500">Penerimaan Kas</Badge>;
    case "PENGELUARAN_KAS":
      return <Badge className="bg-rose-500">Pengeluaran Kas</Badge>;
    case "UMUM":
    default:
      return <Badge className="bg-slate-500">Jurnal Umum</Badge>;
  }
}

export default function JurnalClient({ data }: { data: any[] }) {
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
      }
    },
    {
      accessorKey: "jenisJurnal",
      header: "Jenis Jurnal",
      cell: (item: any) => {
        return getJenisJurnalBadge(item.jenisJurnal);
      }
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
        return <span className="font-semibold">{formatRupiah(item.totalNominal)}</span>;
      }
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
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Lihat Jurnal
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
                    <thead className="bg-slate-100 dark:bg-slate-800">
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
                          <td className="p-3">{d.akun.kodeAkun}</td>
                          <td className="p-3">{d.akun.namaAkun}</td>
                          <td className="p-3 text-right">{formatRupiah(d.nominal)}</td>
                          <td className="p-3 text-right">-</td>
                        </tr>
                      ))}
                      {kredit.map((k: any) => (
                        <tr key={k.id} className="border-t">
                          <td className="p-3">{k.akun.kodeAkun}</td>
                          <td className="p-3 pl-8">{k.akun.namaAkun}</td>
                          <td className="p-3 text-right">-</td>
                          <td className="p-3 text-right">{formatRupiah(k.nominal)}</td>
                        </tr>
                      ))}
                      <tr className="border-t bg-slate-50 dark:bg-slate-900 font-semibold">
                        <td className="p-3" colSpan={2}>Total</td>
                        <td className="p-3 text-right">{formatRupiah(trx.totalNominal)}</td>
                        <td className="p-3 text-right">{formatRupiah(trx.totalNominal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        );
      }
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="nomorTransaksi"
      exportFilename="Semua_Jurnal"
    />
  );
}
