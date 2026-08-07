
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

export default function ClientPage({ akunOptions, tokoPembelian, tokoPenjualan, anggota }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState("");
  const [sumberType, setSumberType] = useState<string>("");
  const [sumberId, setSumberId] = useState<string>("");

  const [debitRows, setDebitRows] = useState<JurnalRow[]>(
    Array.from({ length: 1 }).map(() => ({ id: Math.random().toString(), akunId: "", nominal: 0, keterangan: "" }))
  );
  
  const [kreditRows, setKreditRows] = useState<JurnalRow[]>(
    Array.from({ length: 1 }).map(() => ({ id: Math.random().toString(), akunId: "", nominal: 0, keterangan: "" }))
  );

  const totalDebit = debitRows.reduce((sum, r) => sum + Number(r.nominal || 0), 0);
  const totalKredit = kreditRows.reduce((sum, r) => sum + Number(r.nominal || 0), 0);

  const handleAddDebit = () => setDebitRows([...debitRows, { id: Math.random().toString(), akunId: "", nominal: 0, keterangan: "" }]);
  const handleRemoveDebit = (id: string) => setDebitRows(debitRows.filter(r => r.id !== id));
  const handleChangeDebit = (id: string, field: keyof JurnalRow, value: any) => {
    setDebitRows(debitRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleAddKredit = () => setKreditRows([...kreditRows, { id: Math.random().toString(), akunId: "", nominal: 0, keterangan: "" }]);
  const handleRemoveKredit = (id: string) => setKreditRows(kreditRows.filter(r => r.id !== id));
  const handleChangeKredit = (id: string, field: keyof JurnalRow, value: any) => {
    setKreditRows(kreditRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const onSubmit = async () => {
    if (!tanggal) return toast.error("Tanggal wajib diisi");
    
    if (totalDebit === 0) return toast.error("Total tidak boleh 0");
    if (totalDebit !== totalKredit) return toast.error("Total Debit dan Kredit tidak seimbang");

    const filledDebit = debitRows.filter(r => r.akunId || r.nominal > 0);
    const filledKredit = kreditRows.filter(r => r.akunId || r.nominal > 0);

    const validDebit = filledDebit.every(r => r.akunId && r.nominal > 0);
    const validKredit = filledKredit.every(r => r.akunId && r.nominal > 0);
    
    if (!validDebit || !validKredit || filledDebit.length === 0 || filledKredit.length === 0) {
      return toast.error("Mohon lengkapi baris jurnal dengan akun dan nominal > 0");
    }

    setLoading(true);
    try {
      await submitJurnal({
        tanggal,
        keterangan,
        sumberType,
        sumberId,
        debitRows: filledDebit,
        kreditRows: filledKredit
      });
      toast.success("Jurnal berhasil disimpan");
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
          <Label>Tanggal</Label>
          <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
        </div>
        
        <div className="space-y-2">
          <Label>Sumber Transaksi</Label>
          <div className="flex gap-2">
            <Select value={sumberType} onValueChange={setSumberType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TOKO_PEMBELIAN">Toko Pembelian</SelectItem>
                <SelectItem value="TOKO_PENJUALAN">Toko Penjualan</SelectItem>
                <SelectItem value="ANGGOTA">Anggota</SelectItem>
                <SelectItem value="LAINNYA">Lainnya / Tanpa Sumber</SelectItem>
              </SelectContent>
            </Select>

            {(sumberType && sumberType !== "LAINNYA") && (
              <Select value={sumberId} onValueChange={setSumberId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Pilih Sumber" />
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

        <div className="space-y-2 md:col-span-2">
          <Label>Keterangan</Label>
          <Input placeholder="Keterangan transaksi (opsional)" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
        </div>
      </div>

      <div className="space-y-6">
        <DynamicFormRows
          title="Debit"
          rows={debitRows}
          akunOptions={akunOptions}
          onAddRow={handleAddDebit}
          onRemoveRow={handleRemoveDebit}
          onChangeRow={handleChangeDebit}
          total={totalDebit}
          minRows={1}
          maxRows={999}
        />

        <DynamicFormRows
          title="Kredit"
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
        <Button onClick={onSubmit} disabled={loading} size="lg">
          {loading ? "Menyimpan..." : "Simpan Transaksi"}
        </Button>
      </div>
    </div>
  );
}
