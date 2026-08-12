"use client";

import { useState, useRef, useTransition } from "react";
import { DataTable } from "@/components/data-table";
import { Akun, KategoriAkun, SaldoNormal } from "@prisma/client";
import { KATEGORI_AKUN_LABELS, getSaldoNormal } from "@/lib/accounting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Download, Upload, Search, Edit, Trash2 } from "lucide-react";
import { createAkun, updateAkun, deleteAkun, importAkun } from "./actions";

import * as XLSX from "xlsx";

interface AkunClientProps {
  initialData: Akun[];
}

export default function AkunClient({ initialData }: AkunClientProps) {
  const [data, setData] = useState<Akun[]>(initialData);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("ALL");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    kodeAkun: "",
    namaAkun: "",
    kategori: "ASET_LANCAR" as KategoriAkun,
    saldoNormal: "DEBIT" as SaldoNormal,
    deskripsi: "",
  });

  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If there's no useToast, we can use simple alert, but Shadcn project usually has it.
  // I will check if use-toast exists, if not, I'll fallback to alert or simple toast.

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.kodeAkun.toLowerCase().includes(search.toLowerCase()) ||
      item.namaAkun.toLowerCase().includes(search.toLowerCase());
    const matchKategori =
      kategoriFilter === "ALL" || item.kategori === kategoriFilter;
    return matchSearch && matchKategori;
  });

  const handleKategoriChange = (val: KategoriAkun) => {
    setFormData((prev) => ({
      ...prev,
      kategori: val,
      saldoNormal: getSaldoNormal(val),
    }));
  };

  const resetForm = () => {
    setFormData({
      kodeAkun: "",
      namaAkun: "",
      kategori: "ASET_LANCAR",
      saldoNormal: "DEBIT",
      deskripsi: "",
    });
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (akun: Akun) => {
    setFormData({
      kodeAkun: akun.kodeAkun,
      namaAkun: akun.namaAkun,
      kategori: akun.kategori,
      saldoNormal: akun.saldoNormal,
      deskripsi: akun.deskripsi || "",
    });
    setEditingId(akun.id);
    setIsDialogOpen(true);
  };

  const isFormLoading = isPending || loading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (editingId) {
          const updated = await updateAkun(editingId, formData);
          setData((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
          setIsDialogOpen(false);
        } else {
          const created = await createAkun(formData);
          setData((prev) => [...prev, created]);
          setIsDialogOpen(false);
        }
      } catch (error: any) {
        alert(error.message);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Yakin ingin menghapus akun ini?")) return;
    startTransition(async () => {
      try {
        await deleteAkun(id);
        setData((prev) => prev.filter((a) => a.id !== id));
      } catch (error: any) {
        alert(error.message);
      }
    });
  };

  const handleExport = () => {
    const exportData = filteredData.map((item) => ({
      "Kode Akun": item.kodeAkun,
      "Nama Akun": item.namaAkun,
      Kategori: KATEGORI_AKUN_LABELS[item.kategori],
      "Saldo Normal": item.saldoNormal,
      Deskripsi: item.deskripsi || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chart of Accounts");
    XLSX.writeFile(workbook, "chart_of_accounts.xlsx");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setLoading(true);
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);

        const toImport = rawData.map((row) => {
          // Reverse lookup for Kategori
          const katLabel = row["Kategori"];
          let katValue = "ASET_LANCAR" as KategoriAkun;
          for (const [k, v] of Object.entries(KATEGORI_AKUN_LABELS)) {
            if (v === katLabel) katValue = k as KategoriAkun;
          }

          return {
            kodeAkun: String(row["Kode Akun"]),
            namaAkun: String(row["Nama Akun"]),
            kategori: katValue,
            saldoNormal:
              (row["Saldo Normal"] as SaldoNormal) || getSaldoNormal(katValue),
            deskripsi: row["Deskripsi"] || "",
          };
        });

        startTransition(async () => {
          try {
            const res = await importAkun(toImport);
            alert(`Berhasil import ${res.imported} akun baru.`);
            window.location.reload(); // simple reload to fetch new data
          } catch (err: any) {
            alert("Gagal import: " + err.message);
          } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        });
    };
    reader.readAsBinaryString(file);
  };

  const columns = [
    { header: "Kode", accessorKey: "kodeAkun" },
    { header: "Nama Akun", accessorKey: "namaAkun" },
    {
      header: "Kategori",
      accessorKey: "kategori",
      cell: (item: Akun) => KATEGORI_AKUN_LABELS[item.kategori],
    },
    { header: "Saldo Normal", accessorKey: "saldoNormal" },
    {
      header: "Aksi",
      accessorKey: "id",
      cell: (item: Akun) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(item)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode / nama akun..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              {Object.entries(KATEGORI_AKUN_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <div>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImport}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
          <Button onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Akun
          </Button>
        </div>
      </div>

      <DataTable data={filteredData} columns={columns} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Akun" : "Tambah Akun Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="kodeAkun">Kode Akun</Label>
              <Input
                id="kodeAkun"
                required
                value={formData.kodeAkun}
                onChange={(e) =>
                  setFormData({ ...formData, kodeAkun: e.target.value })
                }
                placeholder="misal: 1-1001"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="namaAkun">Nama Akun</Label>
              <Input
                id="namaAkun"
                required
                value={formData.namaAkun}
                onChange={(e) =>
                  setFormData({ ...formData, namaAkun: e.target.value })
                }
                placeholder="misal: Kas"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select
                value={formData.kategori}
                onValueChange={(val) => handleKategoriChange(val as KategoriAkun)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(KATEGORI_AKUN_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="saldoNormal">Saldo Normal</Label>
              <Select
                value={formData.saldoNormal}
                onValueChange={(val) =>
                  setFormData({ ...formData, saldoNormal: val as SaldoNormal })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEBIT">DEBIT</SelectItem>
                  <SelectItem value="KREDIT">KREDIT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
              <Input
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isFormLoading}>
                {isFormLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
