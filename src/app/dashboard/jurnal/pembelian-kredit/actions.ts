"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { JenisJurnal, PosisiJurnal } from "@prisma/client";

function getJurnalPrefix(jenis: JenisJurnal) {
  switch (jenis) {
    case "PEMBELIAN_KREDIT": return "PK";
    case "PENJUALAN": return "PJ";
    case "PENERIMAAN_KAS": return "BKM";
    case "PENGELUARAN_KAS": return "BKK";
    case "UMUM": return "JU";
    default: return "JU";
  }
}

export async function submitJurnal(data: any) {
  const session = await auth();
  if (!session?.user?.organisasiId) throw new Error("Unauthorized");
  const organisasiId = session.user.organisasiId;

  // Cukup hitung total debit dari request
  const totalDebit = data.debitRows.reduce((sum: number, r: any) => sum + Number(r.nominal), 0);
  if (totalDebit <= 0) throw new Error("Total pembelian harus lebih dari 0.");

  const tanggal = new Date(data.tanggal);
  const month = (tanggal.getMonth() + 1).toString().padStart(2, "0");
  const year = tanggal.getFullYear().toString();
  const prefix = getJurnalPrefix("PEMBELIAN_KREDIT");
  
  const startOfMonth = new Date(tanggal.getFullYear(), tanggal.getMonth(), 1);
  const endOfMonth = new Date(tanggal.getFullYear(), tanggal.getMonth() + 1, 0, 23, 59, 59, 999);

  return await prisma.$transaction(async (tx) => {
    // 1. Cari akun Utang Usaha
    let akunUtang = await tx.akun.findFirst({
      where: { 
        organisasiId, 
        kategori: "KEWAJIBAN_JANGKA_PENDEK",
        namaAkun: { contains: "Utang Usaha" }
      }
    });

    // Fallback: ambil sembarang akun Kewajiban Jangka Pendek jika Utang Usaha tidak ditemukan
    if (!akunUtang) {
      akunUtang = await tx.akun.findFirst({
        where: { organisasiId, kategori: "KEWAJIBAN_JANGKA_PENDEK" }
      });
    }

    if (!akunUtang) {
      throw new Error("Sistem tidak dapat menemukan Akun Kewajiban/Utang untuk mencatat kredit. Silakan tambahkan di menu Chart of Accounts.");
    }

    // 2. Generate Nomor Transaksi
    const count = await tx.transaksi.count({
      where: {
        organisasiId,
        jenisJurnal: "PEMBELIAN_KREDIT",
        tanggal: { gte: startOfMonth, lte: endOfMonth }
      }
    });

    const urutan = (count + 1).toString().padStart(3, "0");
    const nomorTransaksi = `${prefix}-${month}${year}-${urutan}`;

    let tokoPembelianId = null;
    let tokoPenjualanId = null;
    let anggotaId = null;

    if (data.sumberType === 'TOKO_PEMBELIAN') tokoPembelianId = data.sumberId;
    if (data.sumberType === 'TOKO_PENJUALAN') tokoPenjualanId = data.sumberId;
    if (data.sumberType === 'ANGGOTA') anggotaId = data.sumberId;

    // 3. Simpan Transaksi & Detail Jurnal
    const transaksi = await tx.transaksi.create({
      data: {
        nomorTransaksi,
        tanggal,
        jenisJurnal: "PEMBELIAN_KREDIT",
        keterangan: data.keterangan,
        organisasiId,
        tokoPembelianId,
        tokoPenjualanId,
        anggotaId,
        detailJurnal: {
          create: [
            // Baris Debit: Berdasarkan input pengguna (bisa banyak)
            ...data.debitRows.map((r: any) => ({
              akunId: r.akunId,
              posisi: "DEBIT" as PosisiJurnal,
              nominal: Number(r.nominal),
              keterangan: r.keterangan || null
            })),
            // Baris Kredit: Otomatis masuk Utang Usaha dengan total yang sama
            {
              akunId: akunUtang.id,
              posisi: "KREDIT" as PosisiJurnal,
              nominal: totalDebit,
              keterangan: data.keterangan || "Utang Pembelian Kredit"
            }
          ]
        }
      }
    });
    
    return { success: true, data: transaksi };
  }, {
    maxWait: 15000,
    timeout: 30000
  });
}
