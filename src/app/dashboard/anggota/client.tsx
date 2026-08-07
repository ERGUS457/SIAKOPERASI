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
import { Pencil, Trash2 } from "lucide-react";

interface AnggotaClientProps {
  data: Anggota[];
}

export function AnggotaClient({ data }: AnggotaClientProps) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<Anggota | null>(null);
  
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
      cell: (item: Anggota) => (
        <div className="flex gap-2">
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
