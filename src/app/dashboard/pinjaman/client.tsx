"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPinjaman, bayarAngsuran, deletePinjaman } from "./actions";
import { formatRupiah } from "@/lib/utils";

export default function PinjamanClient({ data, anggotaList }: { data: any[], anggotaList: any[] }) {
  const [formData, setFormData] = useState<any>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const columns = [
    {
      accessorKey: "anggota.nama",
      header: "Nama Anggota",
    },
    {
      accessorKey: "jenisPinjaman",
      header: "Jenis Pinjaman",
    },
    {
      accessorKey: "nilaiPinjaman",
      header: "Nilai Pinjaman",
      cell: (item: any) => formatRupiah(item.nilaiPinjaman),
    },
    {
      accessorKey: "angsuranBulan",
      header: "Tenor",
      cell: (item: any) => `${item.angsuranBulan} Bulan`,
    },
    {
      accessorKey: "sisaPinjaman",
      header: "Sisa Pinjaman",
      cell: (item: any) => formatRupiah(item.sisaPinjaman),
    },
    {
      accessorKey: "actions",
      header: "Aksi",
      cell: (item: any) => {
        return (
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              disabled={item.sisaPinjaman <= 0 || isSubmitting}
              onClick={() => handleBayar(item.id)}
            >
              Bayar Angsuran
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isSubmitting}
              onClick={() => handleDelete(item.id)}
            >
              Hapus
            </Button>
          </div>
        );
      },
    },
  ];

  const handleBayar = async (id: string) => {
    if (confirm("Apakah anda yakin ingin membayar angsuran?")) {
      setIsSubmitting(true);
      try {
        await bayarAngsuran(id);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah anda yakin ingin menghapus pinjaman ini?")) {
      setIsSubmitting(true);
      try {
        await deletePinjaman(id);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await createPinjaman(formData);
      setIsDialogOpen(false);
      setFormData({});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsDialogOpen(true)}>Tambah Pinjaman</Button>
      </div>
      <DataTable columns={columns} data={data} searchKey="anggota.nama" />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pinjaman</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="anggotaId" className="text-right">Anggota</Label>
              <select
                id="anggotaId"
                className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.anggotaId || ''}
                onChange={(e) => setFormData({ ...formData, anggotaId: e.target.value })}
              >
                <option value="">Pilih Anggota</option>
                {anggotaList.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.nama}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jenisPinjaman" className="text-right">Jenis Pinjaman</Label>
              <Input
                id="jenisPinjaman"
                value={formData.jenisPinjaman || ''}
                onChange={(e) => setFormData({ ...formData, jenisPinjaman: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tanggalPencairan" className="text-right">Tanggal Pencairan</Label>
              <Input
                id="tanggalPencairan"
                type="date"
                value={formData.tanggalPencairan || ''}
                onChange={(e) => setFormData({ ...formData, tanggalPencairan: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nilaiPinjaman" className="text-right">Nilai Pinjaman</Label>
              <Input
                id="nilaiPinjaman"
                type="number"
                value={formData.nilaiPinjaman || ''}
                onChange={(e) => setFormData({ ...formData, nilaiPinjaman: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="angsuranBulan" className="text-right">Tenor (Bulan)</Label>
              <Input
                id="angsuranBulan"
                type="number"
                value={formData.angsuranBulan || ''}
                onChange={(e) => setFormData({ ...formData, angsuranBulan: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={isSubmitting}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
