"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { getOrganisasiInfo } from "@/lib/actions/organisasi";

export interface ReportColumn {
  header: string;
  accessorKey: string;
  cell?: (item: any) => any;
}

export interface ReportSection {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface ReportConfig {
  namaLaporan: string;
  filename: string;
  startDate?: string;
  endDate?: string;
  // For simple table reports
  columns?: ReportColumn[];
  data?: any[];
  // For complex multi-section reports (neraca, arus kas, etc.)
  sections?: ReportSection[];
}

interface ExportButtonsProps {
  config: ReportConfig;
  label?: string;
}

export function ExportButtons({ config, label = "Lihat Laporan" }: ExportButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const handleViewReport = () => {
    startTransition(async () => {
      try {
        const orgInfo = await getOrganisasiInfo();

        let headers: string[] | undefined;
        let rows: string[][] | undefined;

        if (config.columns && config.data) {
          headers = config.columns
            .filter(col => col.accessorKey !== "actions" && col.header.toLowerCase() !== "aksi")
            .map(col => col.header);

          rows = config.data.map(item =>
            config.columns!
              .filter(col => col.accessorKey !== "actions" && col.header.toLowerCase() !== "aksi")
              .map(col => {
                let val: any = item;
                for (const key of col.accessorKey.split(".")) {
                  if (val == null) break;
                  val = val[key];
                }
                if (col.cell) {
                  try {
                    const cellVal = col.cell(item);
                    if (typeof cellVal === "string" || typeof cellVal === "number") return String(cellVal);
                  } catch {}
                }
                return val != null ? String(val) : "-";
              })
          );
        }

        const reportData = {
          namaLaporan: config.namaLaporan,
          filename: config.filename,
          namaKoperasi: orgInfo?.nama || "",
          alamatKoperasi: orgInfo?.alamat || "",
          teleponKoperasi: orgInfo?.telepon || "",
          emailKoperasi: orgInfo?.email || "",
          startDate: config.startDate,
          endDate: config.endDate,
          tanggalCetak: new Date().toLocaleString("id-ID"),
          headers,
          rows,
          sections: config.sections,
        };

        localStorage.setItem("temp_report_data", JSON.stringify(reportData));
        window.open("/report-preview", "_blank");
      } catch (error) {
        console.error("Gagal membuka laporan", error);
      }
    });
  };

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleViewReport}
      disabled={isPending}
      className="h-8"
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileText className="mr-2 h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
