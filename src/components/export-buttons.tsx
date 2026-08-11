"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonsProps {
  data: any[];
  filename: string;
  columns: { header: string; accessorKey: string; cell?: (item: any) => any }[];
}

export function ExportButtons({ data, filename, columns }: ExportButtonsProps) {
  const handleExportExcel = () => {
    // Flatten data based on columns
    const exportData = data.map((item) => {
      const row: any = {};
      columns.forEach((col) => {
        if (col.accessorKey !== "actions") {
          let val = item;
          const keys = col.accessorKey.split(".");
          for (const key of keys) {
            if (val === null || val === undefined) break;
            val = val[key];
          }
          // If there's a custom cell formatter (like formatRupiah), we could use it, 
          // but for Excel, raw numbers are often better. We'll use the raw value.
          row[col.header] = val;
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add Title
    doc.setFontSize(16);
    doc.text(`Laporan ${filename.replace(/_/g, ' ')}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, 14, 22);

    // Prepare Table Data
    const tableHeaders = columns
      .filter((col) => col.accessorKey !== "actions")
      .map((col) => col.header);

    const tableData = data.map((item) => {
      return columns
        .filter((col) => col.accessorKey !== "actions")
        .map((col) => {
          let val = item;
          const keys = col.accessorKey.split(".");
          for (const key of keys) {
            if (val === null || val === undefined) break;
            val = val[key];
          }
          
          // Use formatter if available (like formatRupiah) so PDF looks nice
          if (col.cell) {
             // For PDF, we need a string. Since React Node can't be put in jsPDF easily,
             // we rely on the fact that our cell functions often return strings (like formatRupiah).
             // If it returns a JSX element (like a Badge), this won't work perfectly.
             try {
               const cellVal = col.cell(item);
               if (typeof cellVal === 'string' || typeof cellVal === 'number') {
                 return cellVal;
               }
             } catch(e) {}
          }
          return val !== null && val !== undefined ? String(val) : "-";
        });
    });

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
    });

    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleExportExcel} className="h-8 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800">
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Excel
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-8 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800">
        <FileText className="mr-2 h-4 w-4" />
        PDF
      </Button>
    </div>
  );
}
