"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Plus, Trash2 } from "lucide-react";
import { KategoriAkun, SaldoNormal } from "@prisma/client";

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
          <div key={row.id} className="grid grid-cols-1 sm:grid-cols-[2fr_1.5fr_2fr_auto] gap-3 items-center bg-muted/50 p-3 rounded-md">
            <div>
              <Combobox
                options={akunOptions.map(akun => ({
                  label: `${akun.kodeAkun} - ${akun.namaAkun}`,
                  value: akun.id
                }))}
                value={row.akunId}
                onChange={(val) => onChangeRow(row.id, "akunId", val)}
                placeholder="Ketik nama akun..."
              />
            </div>
            
            <div>
              <Input
                type="number"
                min="0"
                placeholder="Nominal"
                value={row.nominal || ""}
                onChange={(e) => onChangeRow(row.id, "nominal", Number(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Input
                placeholder="Keterangan (Opsional)"
                value={row.keterangan}
                onChange={(e) => onChangeRow(row.id, "keterangan", e.target.value)}
              />
            </div>

            <div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="shrink-0"
                onClick={() => onRemoveRow(row.id)}
                disabled={rows.length <= minRows}
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
