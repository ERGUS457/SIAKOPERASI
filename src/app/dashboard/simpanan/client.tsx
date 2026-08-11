"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSimpanan } from "./actions";
import { formatRupiah } from "@/lib/utils";

export default function SimpananClient({ data }: { data: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
            Edit
          </Button>
        );
      },
    },
  ];

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingId) {
      await updateSimpanan(editingId, formData);
      setIsDialogOpen(false);
      setEditingId(null);
    }
  };

  return (
    <>
      <DataTable columns={columns} data={data} searchKey="anggota.nama" />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Simpanan</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {["simpananPokok", "simpananWajib", "simpanan", "tambahanModal", "simpananSukarela", "simpanan1", "simpanan2"].map(field => (
              <div key={field} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={field} className="text-right capitalize">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <Input
                  id={field}
                  type="text"
                  value={formData[field] !== undefined && formData[field] !== null ? formatRupiah(Number(formData[field])) : ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, [field]: val ? parseInt(val, 10) : 0 });
                  }}
                  className="col-span-3"
                />
              </div>
            ))}
          </div>

          {formData?.anggota?.transaksi && formData.anggota.transaksi.length > 0 && (
            <div className="py-2 border-t mt-4">
              <h4 className="text-sm font-semibold mb-3">Riwayat Transaksi</h4>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {formData.anggota.transaksi.map((tx: any) => (
                  <div key={tx.id} className="text-sm p-3 border rounded-md flex justify-between items-center bg-muted/30">
                    <div>
                      <p className="font-medium">{new Date(tx.tanggal).toLocaleDateString('id-ID')}</p>
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
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
