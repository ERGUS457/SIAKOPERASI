'use server'

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPinjaman(data: any) {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  const nilaiPinjaman = Number(data.nilaiPinjaman);
  const angsuranBulan = Number(data.angsuranBulan);
  const nilaiPokokAngsuran = nilaiPinjaman / angsuranBulan;

  await prisma.pinjaman.create({
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

  await prisma.$transaction([
    prisma.pinjaman.update({
      where: { id: pinjamanId },
      data: {
        sisaPinjaman: newSisa,
        angsuranKe: newAngsuranKe,
        tanggalPembayaranTerakhir: new Date()
      }
    }),
    prisma.pembayaranAngsuran.create({
      data: {
        pinjamanId: pinjamanId,
        jumlahBayar: pinjaman.nilaiPokokAngsuran,
        tanggalBayar: new Date(),
        angsuranKe: newAngsuranKe,
        sisaPinjaman: newSisa
      }
    })
  ], { maxWait: 15000, timeout: 30000 });

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
