"use client";

import { useState, useTransition } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { quickSimpananTransaction } from "./actions";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SimpananClient({ data, akunKas, akunSimpanan }: { data: any[], akunKas: any[], akunSimpanan: any[] }) {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    jenisTransaksi: "SETOR",
    akunKasId: akunKas[0]?.id || "",
    akunSimpananId: akunSimpanan[0]?.id || "",
    nominal: "",
    keterangan: "Setoran Simpanan",
    tanggal: new Date().toISOString().split('T')[0]
  });

  const columns = [
    {
      accessorKey: "anggota.nama",
      header: "Nama Anggota",
    },
    {
      accessorKey: "simpananPokok",
      header: "Pokok",
      cell: (item: any) => formatRupiah(item.simpananPokok),
    },
    {
      accessorKey: "simpananWajib",
      header: "Wajib",
      cell: (item: any) => formatRupiah(item.simpananWajib),
    },
    {
      accessorKey: "simpanan",
      header: "Sukarela",
      cell: (item: any) => formatRupiah(item.simpanan),
    },
    {
      accessorKey: "actions",
      header: "Aksi",
      cell: (item: any) => {
        return (
          <Button variant="default" size="sm" onClick={() => handleTransaksi(item)}>
            Transaksi
          </Button>
        );
      },
    },
  ];

  const handleTransaksi = (item: any) => {
    setSelectedItem(item);
    setFormData({
      ...formData,
      keterangan: formData.jenisTransaksi === "SETOR" ? "Setoran Simpanan" : "Penarikan Simpanan"
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.nominal || Number(formData.nominal) <= 0) {
      toast.error("Nominal harus lebih dari 0");
      return;
    }
    if (!formData.akunKasId || !formData.akunSimpananId) {
      toast.error("Akun Kas dan Jenis Simpanan harus dipilih");
      return;
    }

    startTransition(async () => {
      try {
        await quickSimpananTransaction({
          jenisTransaksi: formData.jenisTransaksi as "SETOR" | "TARIK",
          anggotaId: selectedItem.anggotaId,
          akunKasId: formData.akunKasId,
          akunSimpananId: formData.akunSimpananId,
          nominal: Number(formData.nominal),
          keterangan: formData.keterangan,
          tanggal: formData.tanggal
        });
        toast.success("Transaksi Simpanan Berhasil");
        setIsDialogOpen(false);
        setSelectedItem(null);
      } catch (error: any) {
        toast.error(error.message || "Terjadi kesalahan");
      }
    });
  };

  return (
    <>
      <DataTable columns={columns} data={data} searchKey="anggota.nama" exportFilename="Data_Simpanan" />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transaksi Simpanan - {selectedItem?.anggota?.nama}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Tanggal</Label>
              <Input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Jenis Transaksi</Label>
              <div className="col-span-3">
                <Select
                  value={formData.jenisTransaksi}
                  onValueChange={(val) => setFormData({ 
                    ...formData, 
                    jenisTransaksi: val,
                    keterangan: val === "SETOR" ? "Setoran Simpanan" : "Penarikan Simpanan" 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis Transaksi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SETOR">Penerimaan (Setor Simpanan)</SelectItem>
                    <SelectItem value="TARIK">Pengeluaran (Tarik Simpanan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Jenis Simpanan</Label>
              <div className="col-span-3">
                <Select
                  value={formData.akunSimpananId}
                  onValueChange={(val) => setFormData({ ...formData, akunSimpananId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Akun Simpanan" />
                  </SelectTrigger>
                  <SelectContent>
                    {akunSimpanan.map((akun) => (
                      <SelectItem key={akun.id} value={akun.id}>
                        {akun.kodeAkun} - {akun.namaAkun}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Akun Pembayaran</Label>
              <div className="col-span-3">
                <Select
                  value={formData.akunKasId}
                  onValueChange={(val) => setFormData({ ...formData, akunKasId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Akun Kas/Bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {akunKas.map((akun) => (
                      <SelectItem key={akun.id} value={akun.id}>
                        {akun.kodeAkun} - {akun.namaAkun}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Nominal</Label>
              <div className="col-span-3">
                <Input
                  type="text"
                  placeholder="Rp 0"
                  value={formData.nominal ? formatRupiah(Number(formData.nominal)) : ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, nominal: val });
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Keterangan</Label>
              <Input
                type="text"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                className="col-span-3"
              />
            </div>
            
          </div>

          {selectedItem?.anggota?.transaksi && selectedItem.anggota.transaksi.length > 0 && (
            <div className="py-2 border-t mt-2">
              <h4 className="text-sm font-semibold mb-3">Riwayat Transaksi Terakhir</h4>
              <div className="max-h-[150px] overflow-y-auto space-y-2">
                {selectedItem.anggota.transaksi.map((tx: any) => (
                  <div key={tx.id} className="text-sm p-3 border rounded-md flex justify-between items-center bg-muted/30">
                    <div>
                      <p className="font-medium">{new Date(tx.tanggal).toLocaleDateString('id-ID')}</p>
                      <p className="text-xs text-muted-foreground">{tx.keterangan}</p>
                    </div>
                    <div className="text-right">
                      {tx.detailJurnal.map((dj: any) => (
                        <div key={dj.id} className={dj.posisi === 'DEBIT' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {dj.akun?.namaAkun} ({dj.posisi}): {formatRupiah(dj.nominal)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Proses Transaksi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
