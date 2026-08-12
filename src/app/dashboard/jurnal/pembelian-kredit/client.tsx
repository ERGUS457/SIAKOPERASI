
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { DynamicFormRows, JurnalRow } from "@/components/dynamic-form-rows";
import { toast } from "sonner";
import { submitJurnal } from "./actions";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { formatRupiah, formatTanggalSingkat } from "@/lib/utils";

export default function ClientPage({ akunOptions, tokoPembelian, anggota, transaksi }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState("");
  const [sumberType, setSumberType] = useState<string>("TOKO_PEMBELIAN");
  const [sumberId, setSumberId] = useState<string>("");

  const [debitRows, setDebitRows] = useState<JurnalRow[]>(
    Array.from({ length: 1 }).map(() => ({ id: Math.random().toString(), akunId: "", nominal: 0, keterangan: "" }))
  );

  const totalDebit = debitRows.reduce((sum, r) => sum + Number(r.nominal || 0), 0);

  const handleAddDebit = () => setDebitRows([...debitRows, { id: Math.random().toString(), akunId: "", nominal: 0, keterangan: "" }]);
  const handleRemoveDebit = (id: string) => setDebitRows(debitRows.filter(r => r.id !== id));
  const handleChangeDebit = (id: string, field: keyof JurnalRow, value: any) => {
    setDebitRows(debitRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const onSubmit = async () => {
    if (!tanggal) return toast.error("Tanggal wajib diisi");
    if (!sumberId) return toast.error("Pemasok/Kontak wajib dipilih");
    if (totalDebit <= 0) return toast.error("Total pembelian harus lebih dari 0");

    const filledDebit = debitRows.filter(r => r.akunId || r.nominal > 0);
    const validDebit = filledDebit.every(r => r.akunId && r.nominal > 0);
    
    if (!validDebit || filledDebit.length === 0) {
      return toast.error("Mohon lengkapi baris barang/beban (Debit) dengan akun dan nominal > 0");
    }

    setLoading(true);
    try {
      await submitJurnal({
        tanggal,
        keterangan,
        sumberType,
        sumberId,
        debitRows: filledDebit,
      });
      toast.success("Jurnal Pembelian Kredit berhasil disimpan");
      setIsDialogOpen(false);
      
      // Reset form
      setTanggal(new Date().toISOString().split('T')[0]);
      setKeterangan("");
      setDebitRows([{ id: Math.random().toString(), akunId: "", nominal: 0, keterangan: "" }]);
      
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const tableData = transaksi.map((t: any) => {
    const total = t.detailJurnal.filter((dj: any) => dj.posisi === "DEBIT").reduce((acc: number, curr: any) => acc + curr.nominal, 0);
    return {
      ...t,
      total,
    }
  });

  const columns = [
    { header: "Tanggal", accessorKey: "tanggal", cell: (item: any) => formatTanggalSingkat(item.tanggal) },
    { header: "No. Transaksi", accessorKey: "nomorTransaksi" },
    { header: "Keterangan", accessorKey: "keterangan" },
    { header: "Total Nilai", accessorKey: "total", cell: (item: any) => formatRupiah(item.total) },
  ];

  return (
    <div className="space-y-6">
      <DataTable 
        data={tableData}
        columns={columns}
        searchKey="nomorTransaksi"
        searchPlaceholder="Cari nomor transaksi..."
        onAdd={() => setIsDialogOpen(true)}
        exportFilename="Riwayat_Pembelian_Kredit"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Pembelian Kredit</DialogTitle>
            <DialogDescription>
              Catat pembelian barang atau aset secara kredit di sini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Pembelian</Label>
                <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>Pemasok (Kontak)</Label>
                <div className="flex gap-2">
                  <Select value={sumberType} onValueChange={setSumberType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Pilih Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TOKO_PEMBELIAN">Toko Pemasok</SelectItem>
                      <SelectItem value="ANGGOTA">Anggota</SelectItem>
                    </SelectContent>
                  </Select>

                  {(sumberType && sumberType !== "LAINNYA") && (
                    <div className="flex-1">
                      <Combobox
                        options={
                          sumberType === "TOKO_PEMBELIAN"
                            ? (tokoPembelian || []).map((t: any) => ({ label: t.namaToko, value: t.id }))
                            : sumberType === "ANGGOTA"
                            ? (anggota || []).map((a: any) => ({ label: a.nama, value: a.id }))
                            : []
                        }
                        value={sumberId}
                        onChange={setSumberId}
                        placeholder="Pilih Kontak / Pemasok"
                        searchPlaceholder="Cari kontak/pemasok..."
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Keterangan Transaksi</Label>
                <Input placeholder="Contoh: Pembelian persediaan barang dagang secara kredit dari Toko A" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border bg-blue-50/50 p-4 dark:bg-blue-950/20 dark:border-blue-900/50">
                <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">Informasi Otomatisasi Jurnal</h4>
                <p className="text-sm text-blue-600/80 dark:text-blue-300/80">
                  Sistem akan otomatis mencatat sisi <strong>Kredit</strong> ke akun <strong>Utang Usaha</strong> sebesar total nominal di bawah ini. Anda hanya perlu memasukkan barang/beban apa yang dibeli pada tabel Debit.
                </p>
              </div>

              <DynamicFormRows
                title="Rincian Pembelian (Debit)"
                rows={debitRows}
                akunOptions={akunOptions}
                onAddRow={handleAddDebit}
                onRemoveRow={handleRemoveDebit}
                onChangeRow={handleChangeDebit}
                total={totalDebit}
                minRows={1}
                maxRows={999}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button onClick={onSubmit} disabled={loading} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                {loading ? "Menyimpan..." : "Simpan Pembelian Kredit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
