"use client";

import { useState, useTransition } from "react";
import { DataTable } from "@/components/data-table";
import { TokoPenjualan } from "@prisma/client";
import { createTokoPenjualan, updateTokoPenjualan, deleteTokoPenjualan } from "./actions";
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

interface TokoPenjualanClientProps {
  data: TokoPenjualan[];
}

export function TokoPenjualanClient({ data }: TokoPenjualanClientProps) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<TokoPenjualan | null>(null);
  
  const [formData, setFormData] = useState({
    namaToko: "",
    alamat: "",
    pemilikToko: "",
    kontak: "",
  });

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({ namaToko: "", alamat: "", pemilikToko: "", kontak: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: TokoPenjualan) => {
    setSelectedItem(item);
    setFormData({
      namaToko: item.namaToko,
      alamat: item.alamat || "",
      pemilikToko: item.pemilikToko || "",
      kontak: item.kontak || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (item: TokoPenjualan) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (selectedItem) {
          await updateTokoPenjualan(selectedItem.id, formData);
        } else {
          await createTokoPenjualan(formData);
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
        await deleteTokoPenjualan(selectedItem.id);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error(error);
      }
    });
  };

  const columns = [
    { header: "Nama Toko", accessorKey: "namaToko" },
    { header: "Pemilik", accessorKey: "pemilikToko" },
    { header: "Kontak", accessorKey: "kontak" },
    { header: "Alamat", accessorKey: "alamat" },
    {
      header: "Aksi",
      accessorKey: "id",
      cell: (item: TokoPenjualan) => (
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
        searchKey="namaToko"
        searchPlaceholder="Cari toko penjualan..."
        onAdd={handleAdd}
        addLabel="Tambah Toko"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Edit Toko Penjualan" : "Tambah Toko Penjualan"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="namaToko">Nama Toko</Label>
              <Input
                id="namaToko"
                value={formData.namaToko}
                onChange={(e) => setFormData({ ...formData, namaToko: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pemilikToko">Pemilik Toko</Label>
              <Input
                id="pemilikToko"
                value={formData.pemilikToko}
                onChange={(e) => setFormData({ ...formData, pemilikToko: e.target.value })}
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
              <Label htmlFor="kontak">Kontak</Label>
              <Input
                id="kontak"
                value={formData.kontak}
                onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
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
              Data toko penjualan ini akan dihapus secara permanen.
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
