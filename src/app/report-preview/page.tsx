"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Download, Printer, Loader2 } from "lucide-react";
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
        setTimeout(() => generatePdfBlob(parsed), 200);
      } catch (e) {
        console.error("Failed to parse report data", e);
        setIsGenerating(false);
      }
    } else {
      setIsGenerating(false);
    }
  }, []);

  const buildDoc = (data: any) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const { namaLaporan, namaKoperasi, alamatKoperasi, teleponKoperasi, emailKoperasi,
      startDate, endDate, tanggalCetak, headers, rows, sections } = data;

    // === KOP SURAT ===
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(namaKoperasi?.toUpperCase() || "KOPERASI", 105, 16, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (alamatKoperasi) doc.text(alamatKoperasi, 105, 22, { align: "center" });

    let contactLine = "";
    if (teleponKoperasi) contactLine += `Telp: ${teleponKoperasi}`;
    if (emailKoperasi) contactLine += (contactLine ? " | " : "") + `Email: ${emailKoperasi}`;
    if (contactLine) doc.text(contactLine, 105, 27, { align: "center" });

    doc.setLineWidth(0.8);
    doc.line(14, 32, 196, 32);

    // === JUDUL LAPORAN ===
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(namaLaporan?.toUpperCase() || "LAPORAN", 105, 40, { align: "center" });

    let periodeText = "";
    if (startDate && endDate) {
      periodeText = `Periode: ${new Date(startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} s/d ${new Date(endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`;
    } else if (startDate) {
      periodeText = `Per: ${new Date(startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`;
    } else {
      periodeText = `Per: ${tanggalCetak || new Date().toLocaleDateString('id-ID')}`;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(periodeText, 105, 47, { align: "center" });
    doc.setFontSize(8);
    doc.text(`Dicetak: ${tanggalCetak}`, 196, 53, { align: "right" });

    let startY = 56;

    // === TABEL DATA (single table) ===
    if (headers && rows) {
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] },
        alternateRowStyles: { fillColor: [245, 248, 255] },
      });
    }

    // === SECTIONS (multiple sections e.g. neraca) ===
    if (sections) {
      for (const section of sections) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(section.title?.toUpperCase() || "", 14, startY + 4);
        startY += 8;

        autoTable(doc, {
          head: [section.headers],
          body: section.rows,
          startY,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [37, 99, 235] },
          alternateRowStyles: { fillColor: [245, 248, 255] },
          didDrawPage: (hookData) => {
            startY = hookData.cursor?.y || startY;
          }
        });
        startY = (doc as any).lastAutoTable.finalY + 8;
      }
    }

    return doc;
  };

  const generatePdfBlob = (data: any) => {
    setIsGenerating(true);
    try {
      const doc = buildDoc(data);
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
    } catch (e) {
      console.error("PDF generation error", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!reportData) return;
    const doc = buildDoc(reportData);
    doc.save(`${reportData.filename || "Laporan"}.pdf`);
  };

  const handleDownloadExcel = () => {
    if (!reportData) return;
    const workbook = XLSX.utils.book_new();

    if (reportData.headers && reportData.rows) {
      const wsData = [reportData.headers, ...reportData.rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(workbook, ws, "Laporan");
    }

    if (reportData.sections) {
      for (const section of reportData.sections) {
        const wsData = [section.headers, ...section.rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(workbook, ws, section.title?.substring(0, 30) || "Data");
      }
    }

    XLSX.writeFile(workbook, `${reportData.filename || "Laporan"}.xlsx`);
  };

  const handlePrint = () => {
    if (pdfBlobUrl) {
      const iframe = document.getElementById("pdf-frame") as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        iframe.contentWindow.print();
      }
    }
  };

  if (!reportData && !isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">Tidak ada data laporan.</p>
          <p className="text-sm mt-2">Silakan buka laporan dari menu Dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* HEADER BAR */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm z-10 sticky top-0">
        <div>
          <h1 className="text-lg font-bold text-gray-800">{reportData?.namaLaporan || "Preview Laporan"}</h1>
          <p className="text-xs text-muted-foreground">{reportData?.namaKoperasi}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={isGenerating || !pdfBlobUrl}
            className="border-gray-200 text-gray-700"
          >
            <Printer className="mr-1 h-4 w-4" />
            Cetak
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadExcel}
            disabled={!reportData}
            className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
          >
            <FileSpreadsheet className="mr-1 h-4 w-4" />
            Excel
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isGenerating || !reportData}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Download className="mr-1 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* PDF VIEWER */}
      <div className="flex-1 p-4 flex justify-center">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full w-full bg-white rounded-lg shadow-sm max-w-5xl">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
            <p className="text-muted-foreground">Menyiapkan Preview PDF...</p>
          </div>
        ) : pdfBlobUrl ? (
          <iframe
            id="pdf-frame"
            src={pdfBlobUrl}
            className="w-full max-w-5xl bg-white rounded-lg shadow-md border-0"
            style={{ height: "calc(100vh - 80px)" }}
            title="PDF Preview"
          />
        ) : (
          <div className="text-center text-muted-foreground mt-20">
            <p>Gagal memuat PDF. Coba refresh halaman.</p>
          </div>
        )}
      </div>
    </div>
  );
}
