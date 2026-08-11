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

  const totalDebit = data.debitRows.reduce((sum: number, r: any) => sum + Number(r.nominal), 0);
  const totalKredit = data.kreditRows.reduce((sum: number, r: any) => sum + Number(r.nominal), 0);

  if (totalDebit !== totalKredit) throw new Error("Total Debit dan Kredit tidak seimbang.");
  if (totalDebit === 0) throw new Error("Total tidak boleh 0.");

  const tanggal = new Date(data.tanggal);
  const month = (tanggal.getMonth() + 1).toString().padStart(2, "0");
  const year = tanggal.getFullYear().toString();
  const prefix = getJurnalPrefix("UMUM");
  
  const startOfMonth = new Date(tanggal.getFullYear(), tanggal.getMonth(), 1);
  const endOfMonth = new Date(tanggal.getFullYear(), tanggal.getMonth() + 1, 0, 23, 59, 59, 999);

  return await prisma.$transaction(async (tx) => {
    const count = await tx.transaksi.count({
      where: {
        organisasiId,
        jenisJurnal: "UMUM",
        tanggal: {
          gte: startOfMonth,
          lte: endOfMonth
        }
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

    const transaksi = await tx.transaksi.create({
      data: {
        nomorTransaksi,
        tanggal,
        jenisJurnal: "UMUM",
        keterangan: data.keterangan,
        organisasiId,
        tokoPembelianId,
        tokoPenjualanId,
        anggotaId,
        detailJurnal: {
          create: [
            ...data.debitRows.map((r: any) => ({
              akunId: r.akunId,
              posisi: "DEBIT" as PosisiJurnal,
              nominal: Number(r.nominal),
              keterangan: r.keterangan || null
            })),
            ...data.kreditRows.map((r: any) => ({
              akunId: r.akunId,
              posisi: "KREDIT" as PosisiJurnal,
              nominal: Number(r.nominal),
              keterangan: r.keterangan || null
            }))
          ]
        }
      }
    });
      // 4. Sinkronisasi dengan tabel Simpanan jika sumbernya adalah Anggota
    if (anggotaId) {
      const simpananAkun = await tx.akun.findMany({
        where: { 
          organisasiId, 
          namaAkun: { contains: "Simpanan", mode: "insensitive" } 
        }
      });
      
      const simpananMap = new Map(simpananAkun.map(a => [a.id, a.namaAkun.toLowerCase()]));

      let diffPokok = 0;
      let diffWajib = 0;
      let diffSukarela = 0;

      // Akun Simpanan bertambah di sisi KREDIT, berkurang di DEBIT
      for (const r of data.kreditRows) {
        const namaAkun = simpananMap.get(r.akunId);
        if (namaAkun) {
          if (namaAkun.includes("pokok")) diffPokok += Number(r.nominal);
          else if (namaAkun.includes("wajib")) diffWajib += Number(r.nominal);
          else if (namaAkun.includes("sukarela")) diffSukarela += Number(r.nominal);
        }
      }

      for (const r of data.debitRows) {
        const namaAkun = simpananMap.get(r.akunId);
        if (namaAkun) {
          if (namaAkun.includes("pokok")) diffPokok -= Number(r.nominal);
          else if (namaAkun.includes("wajib")) diffWajib -= Number(r.nominal);
          else if (namaAkun.includes("sukarela")) diffSukarela -= Number(r.nominal);
        }
      }

      if (diffPokok !== 0 || diffWajib !== 0 || diffSukarela !== 0) {
        const existingSimpanan = await tx.simpanan.findUnique({ where: { anggotaId } });
        if (existingSimpanan) {
          await tx.simpanan.update({
            where: { anggotaId },
            data: {
              simpananPokok: { increment: diffPokok },
              simpananWajib: { increment: diffWajib },
              simpananSukarela: { increment: diffSukarela }
            }
          });
        }
      }
    }

    return { success: true, data: transaksi };
  }, {
    maxWait: 15000,
    timeout: 30000
  });
}
