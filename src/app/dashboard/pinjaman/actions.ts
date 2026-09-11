'use server'

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPinjaman(data: any) {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  // Validasi input — biar error-nya jelas, bukan Prisma enum crash
  if (!data.anggotaId) throw new Error("Anggota wajib dipilih");
  if (!data.jenisPinjaman) throw new Error("Jenis Pinjaman wajib dipilih");
  if (!["PINJAMAN_REGULER","PINJAMAN_KHUSUS","PINJAMAN_DARURAT"].includes(data.jenisPinjaman)) {
    throw new Error(`Jenis Pinjaman tidak valid: ${data.jenisPinjaman}. Pilih PINJAMAN_REGULER / KHUSUS / DARURAT`);
  }
  if (!data.tanggalPencairan) throw new Error("Tanggal Pencairan wajib diisi");
  const nilaiPinjaman = Number(data.nilaiPinjaman);
  const angsuranBulan = Number(data.angsuranBulan);
  if (!nilaiPinjaman || nilaiPinjaman <= 0) throw new Error("Nilai Pinjaman harus > 0");
  if (!angsuranBulan || angsuranBulan <= 0) throw new Error("Tenor (angsuranBulan) harus > 0");
  const nilaiPokokAngsuran = nilaiPinjaman / angsuranBulan;

  await prisma.$transaction(async (tx) => {
    const pinjaman = await tx.pinjaman.create({
      data: {
        anggotaId: data.anggotaId,
        jenisPinjaman: data.jenisPinjaman,
        tanggalPencairan: new Date(data.tanggalPencairan),
        nilaiPinjaman: nilaiPinjaman,
        angsuranBulan: angsuranBulan,
        nilaiPokokAngsuran: nilaiPokokAngsuran,
        sisaPinjaman: nilaiPinjaman,
        angsuranKe: 0
      }
    });

    // Create journal for disbursement
    const { getOrCreateDefaultAkun } = await import("@/lib/accounting-helper");
    const akunKas = await getOrCreateDefaultAkun(organisasiId, 'KAS', tx);
    const akunPiutang = await getOrCreateDefaultAkun(organisasiId, 'PIUTANG_ANGGOTA', tx);
    const nomorTransaksi = `JU-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;

    await tx.transaksi.create({
      data: {
        nomorTransaksi,
        tanggal: new Date(data.tanggalPencairan),
        jenisJurnal: 'PENGELUARAN_KAS',
        keterangan: `Pencairan Pinjaman ${data.jenisPinjaman} Anggota`,
        organisasiId,
        anggotaId: data.anggotaId,
        detailJurnal: {
          create: [
            {
              akunId: akunPiutang.id,
              posisi: 'DEBIT',
              nominal: nilaiPinjaman,
              keterangan: 'Pencatatan Piutang Anggota'
            },
            {
              akunId: akunKas.id,
              posisi: 'KREDIT',
              nominal: nilaiPinjaman,
              keterangan: 'Pengeluaran Kas untuk Pencairan Pinjaman'
            }
          ]
        }
      }
    });
  });

  revalidatePath('/dashboard/pinjaman');
}

export async function bayarAngsuran(pinjamanId: string) {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  const pinjaman = await prisma.pinjaman.findFirst({
    where: { 
        id: pinjamanId,
        anggota: { organisasiId }
    }
  });

  if (!pinjaman) throw new Error("Not found");
  if (pinjaman.sisaPinjaman <= 0) throw new Error("Sudah lunas");

  const newSisa = Math.max(0, pinjaman.sisaPinjaman - pinjaman.nilaiPokokAngsuran);
  const newAngsuranKe = pinjaman.angsuranKe + 1;

  await prisma.$transaction(async (tx) => {
    await tx.pinjaman.update({
      where: { id: pinjamanId },
      data: {
        sisaPinjaman: newSisa,
        angsuranKe: newAngsuranKe,
        tanggalPembayaranTerakhir: new Date()
      }
    });

    await tx.pembayaranAngsuran.create({
      data: {
        pinjamanId: pinjamanId,
        jumlahBayar: pinjaman.nilaiPokokAngsuran,
        tanggalBayar: new Date(),
        angsuranKe: newAngsuranKe,
        sisaPinjaman: newSisa
      }
    });

    // Create journal for payment
    const { getOrCreateDefaultAkun: getAkun2 } = await import("@/lib/accounting-helper");
    const akunKas = await getAkun2(organisasiId, 'KAS', tx);
    const akunPiutang = await getAkun2(organisasiId, 'PIUTANG_ANGGOTA', tx);
    const nomorTransaksi = `JU-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;

    await tx.transaksi.create({
      data: {
        nomorTransaksi,
        tanggal: new Date(),
        jenisJurnal: 'PENERIMAAN_KAS',
        keterangan: `Pembayaran Angsuran ke-${newAngsuranKe} Pinjaman Anggota`,
        organisasiId,
        anggotaId: pinjaman.anggotaId,
        detailJurnal: {
          create: [
            {
              akunId: akunKas.id,
              posisi: 'DEBIT',
              nominal: pinjaman.nilaiPokokAngsuran,
              keterangan: 'Penerimaan Kas dari Angsuran'
            },
            {
              akunId: akunPiutang.id,
              posisi: 'KREDIT',
              nominal: pinjaman.nilaiPokokAngsuran,
              keterangan: 'Pengurangan Piutang Anggota'
            }
          ]
        }
      }
    });
  }, { maxWait: 15000, timeout: 30000 });

  revalidatePath('/dashboard/pinjaman');
}

export async function deletePinjaman(id: string) {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  const existing = await prisma.pinjaman.findFirst({
    where: {
      id,
      anggota: { organisasiId }
    }
  });

  if (!existing) throw new Error("Not found");

  await prisma.pinjaman.delete({ where: { id } });
  revalidatePath('/dashboard/pinjaman');
}
