
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

export default function ClientPage({ akunOptions, tokoPenjualan, anggota }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
        // debitRows tidak dikirim, diotomatisasi di server
        kreditRows: filledKredit
      });
      toast.success("Jurnal Penjualan berhasil disimpan");
      router.push("/dashboard/jurnal");
    } catch (e: any) {
      toast.error(e.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
              <Select value={sumberId} onValueChange={setSumberId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Pilih Kontak" />
                </SelectTrigger>
                <SelectContent>
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

      <div className="flex justify-end pt-4">
        <Button onClick={onSubmit} disabled={loading} size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600">
          {loading ? "Menyimpan..." : "Simpan Penjualan"}
        </Button>
      </div>
    </div>
  );
}
