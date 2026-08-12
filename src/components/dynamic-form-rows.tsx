"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Plus, Trash2 } from "lucide-react";
import { KategoriAkun, SaldoNormal } from "@prisma/client";
import { formatRupiah } from "@/lib/utils";

export interface AkunOption {
  id: string;
  kodeAkun: string;
  namaAkun: string;
  kategori: KategoriAkun;
  saldoNormal: SaldoNormal;
}

export interface JurnalRow {
  id: string;
  akunId: string;
  nominal: number;
  keterangan: string;
}

interface DynamicFormRowsProps {
  title: string;
  rows: JurnalRow[];
  akunOptions: AkunOption[];
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onChangeRow: (id: string, field: keyof JurnalRow, value: any) => void;
  total: number;
  minRows?: number;
  maxRows?: number;
  hideAddButton?: boolean;
}

export function DynamicFormRows({
  title,
  rows,
  akunOptions,
  onAddRow,
  onRemoveRow,
  onChangeRow,
  total,
  minRows = 1,
  maxRows = 999,
  hideAddButton = false,
}: DynamicFormRowsProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{title}</h4>
        <div className="text-sm font-medium">
          Total: <span className="text-primary">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(total)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="p-3.5 rounded-lg bg-muted/40 border border-border/60 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3"
          >
            {/* Akun */}
            <div className="flex-1 min-w-0 sm:min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block sm:hidden">
                Pilih Akun
              </label>
              <Combobox
                options={akunOptions.map((akun) => ({
                  label: `${akun.kodeAkun} - ${akun.namaAkun}`,
                  value: akun.id,
                }))}
                value={row.akunId}
                onChange={(val) => onChangeRow(row.id, "akunId", val)}
                placeholder="Pilih Akun..."
              />
            </div>

            {/* Nominal */}
            <div className="w-full sm:w-44 md:w-52 shrink-0">
              <label className="text-xs font-medium text-muted-foreground mb-1 block sm:hidden">
                Nominal (Rp)
              </label>
              <Input
                type="text"
                placeholder="Rp 0"
                value={row.nominal ? formatRupiah(row.nominal) : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  onChangeRow(row.id, "nominal", Number(raw) || 0);
                }}
                className="h-10 text-sm font-semibold text-primary"
              />
            </div>

            {/* Keterangan */}
            <div className="flex-1 min-w-0 sm:min-w-[150px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block sm:hidden">
                Keterangan
              </label>
              <Input
                placeholder="Keterangan (opsional)"
                value={row.keterangan}
                onChange={(e) => onChangeRow(row.id, "keterangan", e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            {/* Hapus Button */}
            <div className="flex justify-end pt-1 sm:pt-0 shrink-0">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => onRemoveRow(row.id)}
                disabled={rows.length <= minRows}
                title="Hapus Baris"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {!hideAddButton && rows.length < maxRows && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full mt-2 border-dashed"
          onClick={onAddRow}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Baris {title}
        </Button>
      )}
    </div>
  );
}
