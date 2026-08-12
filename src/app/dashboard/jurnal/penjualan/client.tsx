
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

export default function ClientPage({ akunOptions, tokoPenjualan, anggota, transaksi }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState("");
  const [sumberType, setSumberType] = useState<string>("ANGGOTA");
  const [sumberId, setSumberId] = useState<string>("");

  const [kreditRows, setKreditRows] = useState<JurnalRow[]>(
    Array.from({ length: 1 }).map(() => ({ id: Math.random().toString(), akunId: "", nominal: 0, keterangan: "" }))
  );

  const totalKredit = kreditRows.reduce((sum, r) => sum + Number(r.nominal || 0), 0);

  const handleAddKredit = () => setKreditRows([...kreditRows, { id: Math.random().toString(), akunId: "", nominal: 0, keterangan: "" }]);
  const handleRemoveKredit = (id: string) => setKreditRows(kreditRows.filter(r => r.id !== id));
  const handleChangeKredit = (id: string, field: keyof JurnalRow, value: any) => {
    setKreditRows(kreditRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const onSubmit = async () => {
    if (!tanggal) return toast.error("Tanggal wajib diisi");
    if (!sumberId) return toast.error("Pelanggan/Kontak wajib dipilih");
    if (totalKredit <= 0) return toast.error("Total penjualan harus lebih dari 0");

    const filledKredit = kreditRows.filter(r => r.akunId || r.nominal > 0);
    const validKredit = filledKredit.every(r => r.akunId && r.nominal > 0);
    
    if (!validKredit || filledKredit.length === 0) {
      return toast.error("Mohon lengkapi baris pendapatan (Kredit) dengan akun dan nominal > 0");
    }

    setLoading(true);
    try {
      await submitJurnal({
        tanggal,
        keterangan,
        sumberType,
        sumberId,
        kreditRows: filledKredit
      });
      toast.success("Jurnal Penjualan berhasil disimpan");
      setIsDialogOpen(false);
      
      setTanggal(new Date().toISOString().split('T')[0]);
      setKeterangan("");
      setKreditRows([{ id: Math.random().toString(), akunId: "", nominal: 0, keterangan: "" }]);
      
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const tableData = transaksi.map((t: any) => {
    const total = t.detailJurnal.filter((dj: any) => dj.posisi === "KREDIT").reduce((acc: number, curr: any) => acc + curr.nominal, 0);
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
        exportFilename="Riwayat_Penjualan"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl lg:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Penjualan Kredit</DialogTitle>
            <DialogDescription>
              Catat penjualan barang atau jasa secara kredit di sini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Penjualan</Label>
                <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>Pelanggan (Kontak)</Label>
                <div className="flex gap-2">
                  <Select value={sumberType} onValueChange={setSumberType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Pilih Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TOKO_PENJUALAN">Toko Pelanggan</SelectItem>
                      <SelectItem value="ANGGOTA">Anggota</SelectItem>
                    </SelectContent>
                  </Select>

                  {(sumberType && sumberType !== "LAINNYA") && (
                    <div className="flex-1">
                      <Combobox
                        options={
                          sumberType === "TOKO_PENJUALAN"
                            ? (tokoPenjualan || []).map((t: any) => ({ label: t.namaToko, value: t.id }))
                            : sumberType === "ANGGOTA"
                            ? (anggota || []).map((a: any) => ({ label: a.nama, value: a.id }))
                            : []
                        }
                        value={sumberId}
                        onChange={setSumberId}
                        placeholder="Pilih Kontak / Pelanggan"
                        searchPlaceholder="Cari kontak/pelanggan..."
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Keterangan Transaksi</Label>
                <Input placeholder="Contoh: Penjualan barang ke Anggota B" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border bg-emerald-50/50 p-4 dark:bg-emerald-950/20 dark:border-emerald-900/50">
                <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Informasi Otomatisasi Jurnal</h4>
                <p className="text-sm text-emerald-600/80 dark:text-emerald-300/80">
                  Sistem akan otomatis mencatat sisi <strong>Debit</strong> ke akun <strong>Piutang Usaha</strong> sebesar total nominal di bawah ini. Anda hanya perlu memasukkan rincian akun pendapatan pada tabel Kredit.
                </p>
              </div>

              <DynamicFormRows
                title="Rincian Penjualan (Kredit)"
                rows={kreditRows}
                akunOptions={akunOptions}
                onAddRow={handleAddKredit}
                onRemoveRow={handleRemoveKredit}
                onChangeRow={handleChangeKredit}
                total={totalKredit}
                minRows={1}
                maxRows={999}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button onClick={onSubmit} disabled={loading} size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                {loading ? "Menyimpan..." : "Simpan Penjualan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
