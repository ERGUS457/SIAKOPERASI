// ============================================================
// Accounting Logic â€” Logika Perhitungan Akuntansi
// ============================================================
// 
// Double-Entry Bookkeeping Rules:
// 1. Setiap transaksi HARUS memiliki total debit = total kredit
// 2. Akun dengan saldo normal DEBIT bertambah di sisi debit
// 3. Akun dengan saldo normal KREDIT bertambah di sisi kredit
//
// Kategori Akun & Saldo Normal:
// - Aset (Lancar & Tetap)      â†’ Saldo Normal: DEBIT
// - Kewajiban (Jk Pendek & Panjang) â†’ Saldo Normal: KREDIT  
// - Modal                       â†’ Saldo Normal: KREDIT
// - Pendapatan                  â†’ Saldo Normal: KREDIT
// - Beban                       â†’ Saldo Normal: DEBIT
// ============================================================

export type KategoriAkun =
  | "ASET_LANCAR"
  | "ASET_TETAP"
  | "KEWAJIBAN_JANGKA_PENDEK"
  | "KEWAJIBAN_JANGKA_PANJANG"
  | "MODAL"
  | "PENDAPATAN"
  | "BEBAN";

export type SaldoNormal = "DEBIT" | "KREDIT";

/**
 * Menentukan saldo normal berdasarkan kategori akun
 * 
 * Aturan akuntansi:
 * - Aset & Beban â†’ Saldo normal DEBIT (bertambah di debit)
 * - Kewajiban, Modal, Pendapatan â†’ Saldo normal KREDIT (bertambah di kredit)
 */
export function getSaldoNormal(kategori: KategoriAkun): SaldoNormal {
  switch (kategori) {
    case "ASET_LANCAR":
    case "ASET_TETAP":
    case "BEBAN":
      return "DEBIT";
    case "KEWAJIBAN_JANGKA_PENDEK":
    case "KEWAJIBAN_JANGKA_PANJANG":
    case "MODAL":
    case "PENDAPATAN":
      return "KREDIT";
  }
}

/**
 * Menghitung saldo akhir suatu akun berdasarkan entries jurnal
 * 
 * Logika:
 * - Jika saldo normal = DEBIT:
 *   Saldo = Total Debit - Total Kredit
 * - Jika saldo normal = KREDIT:
 *   Saldo = Total Kredit - Total Debit
 * 
 * @param totalDebit - Total nominal di sisi debit
 * @param totalKredit - Total nominal di sisi kredit
 * @param saldoNormal - Saldo normal akun (DEBIT/KREDIT)
 * @returns Saldo akhir (positif = sesuai saldo normal, negatif = berlawanan)
 */
export function hitungSaldoAkun(
  totalDebit: number,
  totalKredit: number,
  saldoNormal: SaldoNormal
): number {
  if (saldoNormal === "DEBIT") {
    return totalDebit - totalKredit;
  } else {
    return totalKredit - totalDebit;
  }
}

/**
 * Validasi double-entry: total debit harus sama dengan total kredit
 * 
 * @param entries - Array of {posisi, nominal}
 * @returns true jika valid (balanced)
 */
export function validateDoubleEntry(
  entries: Array<{ posisi: "DEBIT" | "KREDIT"; nominal: number }>
): boolean {
  const totalDebit = entries
    .filter((e) => e.posisi === "DEBIT")
    .reduce((sum, e) => sum + e.nominal, 0);
  const totalKredit = entries
    .filter((e) => e.posisi === "KREDIT")
    .reduce((sum, e) => sum + e.nominal, 0);

  // Toleransi floating point
  return Math.abs(totalDebit - totalKredit) < 0.01;
}

/**
 * Hitung total debit dan kredit dari entries
 */
export function hitungTotalDebitKredit(
  entries: Array<{ posisi: "DEBIT" | "KREDIT"; nominal: number }>
): { totalDebit: number; totalKredit: number } {
  const totalDebit = entries
    .filter((e) => e.posisi === "DEBIT")
    .reduce((sum, e) => sum + e.nominal, 0);
  const totalKredit = entries
    .filter((e) => e.posisi === "KREDIT")
    .reduce((sum, e) => sum + e.nominal, 0);
  return { totalDebit, totalKredit };
}

/**
 * Menghitung sisa pinjaman setelah pembayaran angsuran
 * 
 * Logika:
 * sisaPinjaman = sisaPinjaman sebelumnya - nilaiPokokAngsuran
 * 
 * @param sisaPinjamanSebelum - Sisa pinjaman sebelum pembayaran
 * @param nilaiPokokAngsuran - Nilai pokok angsuran per bulan
 * @returns Sisa pinjaman setelah pembayaran
 */
export function hitungSisaPinjaman(
  sisaPinjamanSebelum: number,
  nilaiPokokAngsuran: number
): number {
  const sisa = sisaPinjamanSebelum - nilaiPokokAngsuran;
  return Math.max(0, sisa); // Tidak boleh negatif
}

/**
 * Menghitung nilai pokok angsuran dari pinjaman
 * nilaiPokokAngsuran = nilaiPinjaman / angsuranBulan
 */
export function hitungNilaiPokokAngsuran(
  nilaiPinjaman: number,
  angsuranBulan: number
): number {
  if (angsuranBulan <= 0) return 0;
  return nilaiPinjaman / angsuranBulan;
}

/**
 * Label kategori akun untuk tampilan UI
 */
export const KATEGORI_AKUN_LABELS: Record<KategoriAkun, string> = {
  ASET_LANCAR: "Aset Lancar",
  ASET_TETAP: "Aset Tetap",
  KEWAJIBAN_JANGKA_PENDEK: "Kewajiban Jangka Pendek",
  KEWAJIBAN_JANGKA_PANJANG: "Kewajiban Jangka Panjang",
  MODAL: "Modal",
  PENDAPATAN: "Pendapatan",
  BEBAN: "Beban",
};

/**
 * Seed data: Akun-akun standar usaha Indonesia (SAK ETAP)
 */
export const DEFAULT_AKUN_LIST = [
  // === ASET LANCAR ===
  { kodeAkun: "1-1001", namaAkun: "Kas", kategori: "ASET_LANCAR" as KategoriAkun },
  { kodeAkun: "1-1002", namaAkun: "Bank", kategori: "ASET_LANCAR" as KategoriAkun },
  { kodeAkun: "1-1003", namaAkun: "Piutang Usaha", kategori: "ASET_LANCAR" as KategoriAkun },
  { kodeAkun: "1-1004", namaAkun: "Piutang Anggota", kategori: "ASET_LANCAR" as KategoriAkun },
  { kodeAkun: "1-1005", namaAkun: "Persediaan Barang", kategori: "ASET_LANCAR" as KategoriAkun },
  { kodeAkun: "1-1006", namaAkun: "Perlengkapan", kategori: "ASET_LANCAR" as KategoriAkun },
  { kodeAkun: "1-1007", namaAkun: "Biaya Dibayar Dimuka", kategori: "ASET_LANCAR" as KategoriAkun },

  // === ASET TETAP ===
  { kodeAkun: "1-2001", namaAkun: "Tanah", kategori: "ASET_TETAP" as KategoriAkun },
  { kodeAkun: "1-2002", namaAkun: "Bangunan", kategori: "ASET_TETAP" as KategoriAkun },
  { kodeAkun: "1-2003", namaAkun: "Akumulasi Penyusutan Bangunan", kategori: "ASET_TETAP" as KategoriAkun },
  { kodeAkun: "1-2004", namaAkun: "Peralatan", kategori: "ASET_TETAP" as KategoriAkun },
  { kodeAkun: "1-2005", namaAkun: "Akumulasi Penyusutan Peralatan", kategori: "ASET_TETAP" as KategoriAkun },
  { kodeAkun: "1-2006", namaAkun: "Kendaraan", kategori: "ASET_TETAP" as KategoriAkun },
  { kodeAkun: "1-2007", namaAkun: "Akumulasi Penyusutan Kendaraan", kategori: "ASET_TETAP" as KategoriAkun },

  // === KEWAJIBAN JANGKA PENDEK ===
  { kodeAkun: "2-1001", namaAkun: "Utang Usaha", kategori: "KEWAJIBAN_JANGKA_PENDEK" as KategoriAkun },
  { kodeAkun: "2-1002", namaAkun: "Utang Gaji", kategori: "KEWAJIBAN_JANGKA_PENDEK" as KategoriAkun },
  { kodeAkun: "2-1003", namaAkun: "Utang Pajak", kategori: "KEWAJIBAN_JANGKA_PENDEK" as KategoriAkun },
  { kodeAkun: "2-1004", namaAkun: "Pendapatan Diterima Dimuka", kategori: "KEWAJIBAN_JANGKA_PENDEK" as KategoriAkun },

  // === KEWAJIBAN JANGKA PANJANG ===
  { kodeAkun: "2-2001", namaAkun: "Utang Bank", kategori: "KEWAJIBAN_JANGKA_PANJANG" as KategoriAkun },
  { kodeAkun: "2-2002", namaAkun: "Utang Jangka Panjang Lainnya", kategori: "KEWAJIBAN_JANGKA_PANJANG" as KategoriAkun },

  // === MODAL ===
  { kodeAkun: "3-1001", namaAkun: "Simpanan Pokok", kategori: "MODAL" as KategoriAkun },
  { kodeAkun: "3-1002", namaAkun: "Simpanan Wajib", kategori: "MODAL" as KategoriAkun },
  { kodeAkun: "3-1003", namaAkun: "Dana Cadangan", kategori: "MODAL" as KategoriAkun },
  { kodeAkun: "3-1004", namaAkun: "SHU Tahun Berjalan", kategori: "MODAL" as KategoriAkun },
  { kodeAkun: "3-1005", namaAkun: "SHU Tahun Lalu", kategori: "MODAL" as KategoriAkun },
  { kodeAkun: "3-1006", namaAkun: "Modal Donasi", kategori: "MODAL" as KategoriAkun },

  // === PENDAPATAN ===
  { kodeAkun: "4-1001", namaAkun: "Pendapatan Penjualan", kategori: "PENDAPATAN" as KategoriAkun },
  { kodeAkun: "4-1002", namaAkun: "Pendapatan Jasa", kategori: "PENDAPATAN" as KategoriAkun },
  { kodeAkun: "4-1003", namaAkun: "Pendapatan Bunga Pinjaman", kategori: "PENDAPATAN" as KategoriAkun },
  { kodeAkun: "4-1004", namaAkun: "Pendapatan Lain-lain", kategori: "PENDAPATAN" as KategoriAkun },

  // === BEBAN ===
  { kodeAkun: "5-1001", namaAkun: "Beban Gaji", kategori: "BEBAN" as KategoriAkun },
  { kodeAkun: "5-1002", namaAkun: "Beban Sewa", kategori: "BEBAN" as KategoriAkun },
  { kodeAkun: "5-1003", namaAkun: "Beban Listrik & Air", kategori: "BEBAN" as KategoriAkun },
  { kodeAkun: "5-1004", namaAkun: "Beban Telepon & Internet", kategori: "BEBAN" as KategoriAkun },
  { kodeAkun: "5-1005", namaAkun: "Beban Perlengkapan", kategori: "BEBAN" as KategoriAkun },
  { kodeAkun: "5-1006", namaAkun: "Beban Penyusutan", kategori: "BEBAN" as KategoriAkun },
  { kodeAkun: "5-1007", namaAkun: "Beban Transportasi", kategori: "BEBAN" as KategoriAkun },
  { kodeAkun: "5-1008", namaAkun: "Beban Administrasi", kategori: "BEBAN" as KategoriAkun },
  { kodeAkun: "5-1009", namaAkun: "Harga Pokok Penjualan", kategori: "BEBAN" as KategoriAkun },
  { kodeAkun: "5-1010", namaAkun: "Beban Lain-lain", kategori: "BEBAN" as KategoriAkun },
];
