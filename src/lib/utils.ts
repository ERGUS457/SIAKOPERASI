import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format angka ke format Rupiah Indonesia
 * @param amount - Jumlah nominal
 * @returns String format Rupiah (contoh: Rp 1.000.000)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format tanggal ke format Indonesia
 * @param date - Date object atau string
 * @returns String format tanggal (contoh: 06 Agustus 2026)
 */
export function formatTanggal(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Format tanggal singkat
 * @param date - Date object atau string
 * @returns String format tanggal (contoh: 06/08/2026)
 */
export function formatTanggalSingkat(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Generate nomor transaksi otomatis
 * Format: {PREFIX}-{MMYYYY}-{SEQ}
 * Contoh: PK-082026-001
 * 
 * @param prefix - Prefix berdasarkan jenis jurnal
 * @param date - Tanggal transaksi
 * @param sequence - Nomor urut
 * @returns Nomor transaksi
 */
export function generateNomorTransaksi(
  prefix: string,
  date: Date,
  sequence: number
): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  const seq = String(sequence).padStart(3, "0");
  return `${prefix}-${month}${year}-${seq}`;
}

/**
 * Mendapatkan prefix berdasarkan jenis jurnal
 */
export function getJurnalPrefix(jenisJurnal: string): string {
  const prefixMap: Record<string, string> = {
    PEMBELIAN_KREDIT: "PK",
    PENJUALAN: "PJ",
    PENERIMAAN_KAS: "BKM",
    PENGELUARAN_KAS: "BKK",
    UMUM: "JU",
  };
  return prefixMap[jenisJurnal] || "JU";
}
