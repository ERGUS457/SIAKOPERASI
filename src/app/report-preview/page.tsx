"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportPreviewPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem("temp_report_data");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setReportData(parsed);
        generatePDF(parsed);
      } catch (e) {
        console.error("Failed to parse report data", e);
      }
    }
  }, []);

  const generatePDF = (data: any, forDownload: boolean = false) => {
    setIsGenerating(true);
    setTimeout(() => {
      const doc = new jsPDF();
      
      const { filename, orgInfo, headers, rows } = data;

      // === KOP SURAT (HEADER) ===
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(orgInfo?.nama || "KOPERASI", 105, 15, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      if (orgInfo?.alamat) {
        doc.text(orgInfo.alamat, 105, 21, { align: "center" });
      }
      
      let contactText = "";
      if (orgInfo?.telepon) contactText += `Telp: ${orgInfo.telepon}`;
      if (orgInfo?.email) {
        if (contactText) contactText += ` | `;
        contactText += `Email: ${orgInfo.email}`;
      }
      if (contactText) {
        doc.text(contactText, 105, 26, { align: "center" });
      }

      // Garis Pembatas KOP
      doc.setLineWidth(0.5);
      doc.line(14, 31, 196, 31);
      
      // === JUDUL LAPORAN ===
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`LAPORAN ${filename.toUpperCase().replace(/_/g, ' ')}`, 105, 40, { align: "center" });
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, 14, 48);

      // === TABEL DATA ===
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 52,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
      });

      if (forDownload) {
        doc.save(`${filename}.pdf`);
      } else {
        const blobUrl = doc.output('bloburl');
        setPdfBlobUrl(blobUrl.toString());
      }
      setIsGenerating(false);
    }, 100);
  };

  const handleDownloadExcel = () => {
    if (!reportData) return;
    
    // Flatten data for Excel
    const exportData = reportData.rows.map((row: any[]) => {
      const obj: any = {};
      reportData.headers.forEach((header: string, index: number) => {
        obj[header] = row[index];
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${reportData.filename}.xlsx`);
  };

  const handleDownloadPDF = () => {
    if (reportData) {
      generatePDF(reportData, true);
    }
  };

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Memuat Laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm z-10 sticky top-0">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Preview Laporan</h1>
          <p className="text-sm text-muted-foreground">
            {reportData.filename.replace(/_/g, ' ')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleDownloadExcel}
            className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Download Excel
          </Button>
          <Button 
            onClick={handleDownloadPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-6 flex justify-center items-start h-[calc(100vh-80px)] overflow-hidden">
        {isGenerating || !pdfBlobUrl ? (
          <div className="flex flex-col items-center justify-center h-full w-full bg-white rounded-lg shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
            <p className="text-muted-foreground">Menyiapkan Preview PDF...</p>
          </div>
        ) : (
          <iframe 
            src={pdfBlobUrl} 
            className="w-full max-w-5xl h-full bg-white rounded-lg shadow-md border-0"
            title="PDF Preview"
          />
        )}
      </div>
    </div>
  );
}
