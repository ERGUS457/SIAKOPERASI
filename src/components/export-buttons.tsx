"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { getOrganisasiInfo } from "@/lib/actions/organisasi";

interface ExportButtonsProps {
  data: any[];
  filename: string;
  columns: { header: string; accessorKey: string; cell?: (item: any) => any }[];
}

export function ExportButtons({ data, filename, columns }: ExportButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const handleViewReport = () => {
    startTransition(async () => {
      try {
      
      const orgInfo = await getOrganisasiInfo();

      const tableHeaders = columns
        .filter((col) => col.accessorKey !== "actions" && col.header.toLowerCase() !== "aksi")
        .map((col) => col.header);

      const tableData = data.map((item) => {
        return columns
          .filter((col) => col.accessorKey !== "actions" && col.header.toLowerCase() !== "aksi")
          .map((col) => {
            let val = item;
            const keys = col.accessorKey.split(".");
            for (const key of keys) {
              if (val === null || val === undefined) break;
              val = val[key];
            }
            
            if (col.cell) {
               try {
                 const cellVal = col.cell(item);
                 if (typeof cellVal === 'string' || typeof cellVal === 'number') {
                   return String(cellVal);
                 }
               } catch(e) {}
            }
            return val !== null && val !== undefined ? String(val) : "-";
          });
      });

      const reportData = {
        filename,
        orgInfo,
        headers: tableHeaders,
        rows: tableData
      };

      localStorage.setItem("temp_report_data", JSON.stringify(reportData));
      window.open("/report-preview", "_blank");
      
    } catch (error) {
      console.error("Gagal membuka laporan", error);
    }
    }); // Close startTransition
  };

  return (
    <div className="flex items-center gap-2">
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
        Lihat Laporan
      </Button>
    </div>
  );
}
