"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Download, Printer, Loader2, Filter, RotateCcw } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportPreviewPage() {
  const [originalReportData, setOriginalReportData] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem("temp_report_data");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setOriginalReportData(parsed);
        if (parsed.startDate) setStartDate(parsed.startDate);
        if (parsed.endDate) setEndDate(parsed.endDate);
      } catch (e) {
        console.error("Failed to parse report data", e);
        setIsGenerating(false);
      }
    } else {
      setIsGenerating(false);
    }
  }, []);

  // Parse date string into YYYY-MM-DD for comparison
  const parseDateToIso = (dateStr: any): string | null => {
    if (!dateStr || typeof dateStr !== "string" || dateStr === "-") return null;
    
    // If format is DD/MM/YYYY or DD/MM/YYYY, HH:MM
    if (dateStr.includes("/")) {
      const parts = dateStr.trim().split(" ")[0].split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }
    // If format is ISO YYYY-MM-DD
    if (dateStr.includes("-")) {
      return dateStr.split("T")[0];
    }
    return null;
  };

  // Filter report data by date range
  const filteredReportData = useMemo(() => {
    if (!originalReportData) return null;
    if (!startDate && !endDate) return originalReportData;

    const copy = JSON.parse(JSON.stringify(originalReportData));
    copy.startDate = startDate;
    copy.endDate = endDate;

    // Filter main table rows if present
    if (copy.headers && copy.rows && Array.isArray(copy.rows)) {
      // Find date column index
      let dateColIdx = copy.headers.findIndex((h: string) =>
        /tanggal|date|tgl/i.test(h)
      );
      if (dateColIdx === -1) dateColIdx = 0;

      copy.rows = copy.rows.filter((row: string[]) => {
        // Exclude total/summary rows from date filtering
        const firstCell = String(row[0] || "").toLowerCase();
        const secondCell = String(row[1] || "").toLowerCase();
        if (!firstCell || firstCell === "-" || firstCell === "total" || secondCell.includes("total")) {
          return true;
        }

        const dateIso = parseDateToIso(row[dateColIdx]);
        if (!dateIso) return true;

        if (startDate && dateIso < startDate) return false;
        if (endDate && dateIso > endDate) return false;

        return true;
      });
    }

    // Filter multi-section rows if present
    if (copy.sections && Array.isArray(copy.sections)) {
      copy.sections = copy.sections.map((section: any) => {
        let dateColIdx = (section.headers || []).findIndex((h: string) =>
          /tanggal|date|tgl/i.test(h)
        );
        if (dateColIdx === -1) dateColIdx = 0;

        const newRows = (section.rows || []).filter((row: string[]) => {
          const firstCell = String(row[0] || "").toLowerCase();
          if (!firstCell || firstCell === "-" || firstCell.includes("total") || firstCell.includes("laba")) {
            return true;
          }

          const dateIso = parseDateToIso(row[dateColIdx]);
          if (!dateIso) return true;

          if (startDate && dateIso < startDate) return false;
          if (endDate && dateIso > endDate) return false;

          return true;
        });

        return { ...section, rows: newRows };
      });
    }

    return copy;
  }, [originalReportData, startDate, endDate]);

  // Re-generate PDF Blob whenever filteredReportData changes
  useEffect(() => {
    if (filteredReportData) {
      generatePdfBlob(filteredReportData);
    }
  }, [filteredReportData]);

  const buildDoc = (data: any) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const {
      namaLaporan,
      namaKoperasi,
      alamatKoperasi,
      teleponKoperasi,
      emailKoperasi,
      startDate: sDate,
      endDate: eDate,
      tanggalCetak,
      headers,
      rows,
      sections,
    } = data;

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
    if (sDate && eDate) {
      periodeText = `Periode: ${new Date(sDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })} s/d ${new Date(eDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`;
    } else if (sDate) {
      periodeText = `Per Tanggal: ${new Date(sDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`;
    } else {
      periodeText = `Per: ${tanggalCetak || new Date().toLocaleDateString("id-ID")}`;
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
          },
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
    if (!filteredReportData) return;
    const doc = buildDoc(filteredReportData);
    doc.save(`${filteredReportData.filename || "Laporan"}.pdf`);
  };

  const handleDownloadExcel = () => {
    if (!filteredReportData) return;
    const workbook = XLSX.utils.book_new();

    if (filteredReportData.headers && filteredReportData.rows) {
      const wsData = [filteredReportData.headers, ...filteredReportData.rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(workbook, ws, "Laporan");
    }

    if (filteredReportData.sections) {
      for (const section of filteredReportData.sections) {
        const wsData = [section.headers, ...section.rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(
          workbook,
          ws,
          section.title?.substring(0, 30) || "Data"
        );
      }
    }

    XLSX.writeFile(workbook, `${filteredReportData.filename || "Laporan"}.xlsx`);
  };

  const handlePrint = () => {
    if (pdfBlobUrl) {
      const iframe = document.getElementById("pdf-frame") as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        iframe.contentWindow.print();
      }
    }
  };

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  if (!originalReportData && !isGenerating) {
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
      <div className="bg-white border-b px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm z-10 sticky top-0">
        <div>
          <h1 className="text-lg font-bold text-gray-800">
            {originalReportData?.namaLaporan || "Preview Laporan"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {originalReportData?.namaKoperasi}
          </p>
        </div>

        {/* DATE FILTER BAR */}
        <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-lg border">
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-semibold text-gray-700">Filter Tanggal:</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Dari</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 text-xs w-36 bg-white"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">s/d</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 text-xs w-36 bg-white"
            />
          </div>

          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilter}
              className="h-8 px-2 text-xs text-gray-600 hover:text-gray-900"
              title="Reset Filter Tanggal"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* ACTION BUTTONS */}
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
            disabled={!filteredReportData}
            className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
          >
            <FileSpreadsheet className="mr-1 h-4 w-4" />
            Excel
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isGenerating || !filteredReportData}
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
          <div className="flex flex-col items-center justify-center h-full w-full bg-white rounded-lg shadow-sm max-w-5xl py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
            <p className="text-muted-foreground">Menyiapkan Preview PDF...</p>
          </div>
        ) : pdfBlobUrl ? (
          <iframe
            id="pdf-frame"
            src={pdfBlobUrl}
            className="w-full max-w-5xl bg-white rounded-lg shadow-md border-0"
            style={{ height: "calc(100vh - 100px)" }}
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
