
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

export default function ClientPage({ akunOptions, tokoPembelian, anggota }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
        // kreditRows tidak dikirim dari UI, akan diotomatisasi di server
      });
      toast.success("Jurnal Pembelian Kredit berhasil disimpan");
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
              <Select value={sumberId} onValueChange={setSumberId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Pilih Kontak" />
                </SelectTrigger>
                <SelectContent>
                  {sumberType === "TOKO_PEMBELIAN" && tokoPembelian?.map((t: any) => (
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

      <div className="flex justify-end pt-4">
        <Button onClick={onSubmit} disabled={loading} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600">
          {loading ? "Menyimpan..." : "Simpan Pembelian Kredit"}
        </Button>
      </div>
    </div>
  );
}
