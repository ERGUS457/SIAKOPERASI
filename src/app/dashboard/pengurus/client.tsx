"use client";

import { useState, useTransition } from "react";
import { DataTable } from "@/components/data-table";
import { Pengurus } from "@prisma/client";
import { createPengurus, updatePengurus, deletePengurus } from "./actions";
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
import { toast } from "sonner"; // Assuming sonner or similar is used, fallback to standard error alerts if not

interface PengurusClientProps {
  data: Pengurus[];
}

export function PengurusClient({ data }: PengurusClientProps) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<Pengurus | null>(null);
  
  const [formData, setFormData] = useState({
    nama: "",
    jabatan: "",
    alamat: "",
    telepon: "",
    email: "",
  });

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({ nama: "", jabatan: "", alamat: "", telepon: "", email: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Pengurus) => {
    setSelectedItem(item);
    setFormData({
      nama: item.nama,
      jabatan: item.jabatan,
      alamat: item.alamat || "",
      telepon: item.telepon || "",
      email: item.email || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (item: Pengurus) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (selectedItem) {
          await updatePengurus(selectedItem.id, formData);
        } else {
          await createPengurus(formData);
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
        await deletePengurus(selectedItem.id);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error(error);
      }
    });
  };

  const columns = [
    { header: "Nama", accessorKey: "nama" },
    { header: "Jabatan", accessorKey: "jabatan" },
    { header: "Telepon", accessorKey: "telepon" },
    { header: "Email", accessorKey: "email" },
    {
      header: "Aksi",
      accessorKey: "id",
      cell: (item: Pengurus) => (
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
        searchPlaceholder="Cari pengurus..."
        onAdd={handleAdd}
        addLabel="Tambah Pengurus"
        exportFilename="Daftar_Pengurus"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Edit Pengurus" : "Tambah Pengurus"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
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
              <Label htmlFor="jabatan">Jabatan</Label>
              <Input
                id="jabatan"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
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
              Data pengurus ini akan dihapus secara permanen.
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
