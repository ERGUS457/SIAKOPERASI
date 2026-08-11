"use client";

import { useState, useTransition } from "react";
import { DataTable } from "@/components/data-table";
import { Anggota } from "@prisma/client";
import { createAnggota, updateAnggota, deleteAnggota } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Eye } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface AnggotaClientProps {
  data: any[];
}

export function AnggotaClient({ data }: AnggotaClientProps) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const handleDetail = (item: any) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };
  
  const [formData, setFormData] = useState({
    nomorAnggota: "",
    nama: "",
    alamat: "",
    telepon: "",
    email: "",
  });

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({ nomorAnggota: "", nama: "", alamat: "", telepon: "", email: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Anggota) => {
    setSelectedItem(item);
    setFormData({
      nomorAnggota: item.nomorAnggota,
      nama: item.nama,
      alamat: item.alamat || "",
      telepon: item.telepon || "",
      email: item.email || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (item: Anggota) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (selectedItem) {
          await updateAnggota(selectedItem.id, formData);
        } else {
          await createAnggota(formData);
        }
        setIsDialogOpen(false);
      } catch (error) {
        console.error(error);
      }
    });
  };

  const onDelete = () => {
    if (!selectedItem) return;
    startTransition(async () => {
      try {
        await deleteAnggota(selectedItem.id);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error(error);
      }
    });
  };

  const columns = [
    { header: "No. Anggota", accessorKey: "nomorAnggota" },
    { header: "Nama", accessorKey: "nama" },
    { header: "Telepon", accessorKey: "telepon" },
    { header: "Email", accessorKey: "email" },
    {
      header: "Aksi",
      accessorKey: "id",
      cell: (item: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => handleDetail(item)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(item)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        searchKey="nama"
        searchPlaceholder="Cari anggota..."
        onAdd={handleAdd}
        addLabel="Tambah Anggota"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Edit Anggota" : "Tambah Anggota"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomorAnggota">Nomor Anggota</Label>
              <Input
                id="nomorAnggota"
                value={formData.nomorAnggota}
                onChange={(e) => setFormData({ ...formData, nomorAnggota: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nama">Nama</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Input
                id="alamat"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telepon">Telepon</Label>
              <Input
                id="telepon"
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Anggota</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nomor Anggota</p>
                <p className="font-medium">{selectedItem?.nomorAnggota}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nama</p>
                <p className="font-medium">{selectedItem?.nama}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tanggal Daftar</p>
                <p className="font-medium">{selectedItem?.tanggalDaftar ? new Date(selectedItem.tanggalDaftar).toLocaleDateString('id-ID') : '-'}</p>
              </div>
            </div>

            <div className="py-2 border-t mt-4">
              <h4 className="text-sm font-semibold mb-3">Riwayat Transaksi</h4>
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {selectedItem?.transaksi && selectedItem.transaksi.length > 0 ? (
                  selectedItem.transaksi.map((tx: any) => (
                    <div key={tx.id} className="text-sm p-3 border rounded-md flex justify-between items-center bg-muted/30">
                      <div>
                        <p className="font-medium">{new Date(tx.tanggal).toLocaleDateString('id-ID')} - {tx.nomorTransaksi}</p>
                        <p className="text-xs text-muted-foreground">{tx.keterangan}</p>
                      </div>
                      <div className="text-right">
                        {tx.detailJurnal.map((dj: any) => (
                          <div key={dj.id} className={dj.posisi === 'DEBIT' ? 'text-green-600' : 'text-red-600'}>
                            {dj.akun?.namaAkun} ({dj.posisi}): {formatRupiah(dj.nominal)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Belum ada riwayat transaksi.</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Data anggota ini akan dihapus secara permanen beserta data simpanannya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} disabled={isPending} className="bg-destructive text-destructive-foreground">
              {isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
