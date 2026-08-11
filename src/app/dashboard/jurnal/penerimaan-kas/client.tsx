
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DynamicFormRows, JurnalRow } from "@/components/dynamic-form-rows";
import { toast } from "sonner";
import { submitJurnal } from "./actions";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { formatRupiah, formatTanggalSingkat } from "@/lib/utils";

export default function ClientPage({ akunOptions, tokoPembelian, tokoPenjualan, anggota, transaksi }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState("");
  const [sumberType, setSumberType] = useState<string>("");
  const [sumberId, setSumberId] = useState<string>("");
  
  const [akunKasId, setAkunKasId] = useState<string>("");

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
    if (!sumberId && sumberType) return toast.error("Pengirim Dana wajib dipilih");
    if (!akunKasId) return toast.error("Akun Penerima (Kas/Bank) wajib dipilih");
    if (totalKredit <= 0) return toast.error("Total penerimaan harus lebih dari 0");

    const filledKredit = kreditRows.filter(r => r.akunId || r.nominal > 0);
    const validKredit = filledKredit.every(r => r.akunId && r.nominal > 0);
    
    if (!validKredit || filledKredit.length === 0) {
      return toast.error("Mohon lengkapi baris asal dana (Kredit) dengan akun dan nominal > 0");
    }

    setLoading(true);
    try {
      await submitJurnal({
        tanggal,
        keterangan,
        sumberType,
        sumberId,
        akunKasId,
        kreditRows: filledKredit
      });
      toast.success("Jurnal Penerimaan Kas berhasil disimpan");
      setIsDialogOpen(false);
      
      setTanggal(new Date().toISOString().split('T')[0]);
      setKeterangan("");
      setKreditRows([{ id: Math.random().toString(), akunId: "", nominal: 0, keterangan: "" }]);
      setAkunKasId("");
      
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const kasBankOptions = akunOptions?.filter((a: any) => 
    a.kategori === 'ASET_LANCAR' && (a.namaAkun.toLowerCase().includes('kas') || a.namaAkun.toLowerCase().includes('bank'))
  ) || [];

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
        exportFilename="Riwayat_Penerimaan_Kas"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Penerimaan Kas</DialogTitle>
            <DialogDescription>
              Catat penerimaan uang tunai atau transfer bank di sini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Penerimaan</Label>
                <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>Akun Penerima (Kas / Bank)</Label>
                <Select value={akunKasId} onValueChange={setAkunKasId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Akun Kas/Bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {kasBankOptions.map((akun: any) => (
                      <SelectItem key={akun.id} value={akun.id}>
                        {akun.kodeAkun} - {akun.namaAkun}
                      </SelectItem>
                    ))}
                    {kasBankOptions.length === 0 && (
                      <SelectItem value="none" disabled>Tidak ada akun Kas/Bank ditemukan</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pengirim Dana (Opsional)</Label>
                <div className="flex gap-2">
                  <Select value={sumberType} onValueChange={setSumberType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Pilih Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ANGGOTA">Anggota</SelectItem>
                      <SelectItem value="TOKO_PENJUALAN">Pelanggan</SelectItem>
                      <SelectItem value="TOKO_PEMBELIAN">Pemasok</SelectItem>
                    </SelectContent>
                  </Select>

                  {(sumberType && sumberType !== "LAINNYA") && (
                    <Select value={sumberId} onValueChange={setSumberId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Pilih Kontak" />
                      </SelectTrigger>
                      <SelectContent>
                        {sumberType === "TOKO_PEMBELIAN" && tokoPembelian?.map((t: any) => (
                          <SelectItem key={t.id} value={t.id}>{t.namaToko}</SelectItem>
                        ))}
                        {sumberType === "TOKO_PENJUALAN" && tokoPenjualan?.map((t: any) => (
                          <SelectItem key={t.id} value={t.id}>{t.namaToko}</SelectItem>
                        ))}
                        {sumberType === "ANGGOTA" && anggota?.map((a: any) => (
                          <SelectItem key={a.id} value={a.id}>{a.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Keterangan Transaksi</Label>
                <Input placeholder="Contoh: Penerimaan pelunasan piutang" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border bg-amber-50/50 p-4 dark:bg-amber-950/20 dark:border-amber-900/50">
                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">Informasi Otomatisasi Jurnal</h4>
                <p className="text-sm text-amber-600/80 dark:text-amber-300/80">
                  Sistem akan otomatis mencatat sisi <strong>Debit</strong> ke Akun Penerima yang Anda pilih di atas sebesar total nominal di bawah ini. Anda hanya perlu memasukkan rincian asal dana pada tabel Kredit (contoh: Piutang, Pendapatan Bunga).
                </p>
              </div>

              <DynamicFormRows
                title="Asal Dana (Kredit)"
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
              <Button onClick={onSubmit} disabled={loading} size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                {loading ? "Menyimpan..." : "Simpan Penerimaan Kas"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
