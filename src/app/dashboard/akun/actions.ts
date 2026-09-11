"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { KategoriAkun, SaldoNormal } from "@prisma/client";

function getOrgId(session: any): string | null {
  return session?.organisasiId || session?.user?.organisasiId || null;
}

export async function createAkun(data: {
  kodeAkun: string;
  namaAkun: string;
  kategori: KategoriAkun;
  saldoNormal: SaldoNormal;
  deskripsi?: string;
}) {
  const session = await auth();
  const organisasiId = getOrgId(session);
  if (!organisasiId) return { error: "Unauthorized" };

  const existing = await prisma.akun.findFirst({
    where: {
      kodeAkun: data.kodeAkun,
      organisasiId,
    },
  });

  if (existing) {
    return { error: "Kode Akun sudah digunakan" };
  }

  const akun = await prisma.akun.create({
    data: {
      ...data,
      organisasiId,
    },
  });

  revalidatePath("/dashboard/akun");
  return { data: akun };
}

export async function updateAkun(
  id: string,
  data: {
    kodeAkun: string;
    namaAkun: string;
    kategori: KategoriAkun;
    saldoNormal: SaldoNormal;
    deskripsi?: string;
  }
) {
  const session = await auth();
  const organisasiId = getOrgId(session);
  if (!organisasiId) return { error: "Unauthorized" };

  const existing = await prisma.akun.findFirst({
    where: {
      kodeAkun: data.kodeAkun,
      organisasiId,
      NOT: { id },
    },
  });

  if (existing) {
    return { error: "Kode Akun sudah digunakan" };
  }

  const owner = await prisma.akun.findFirst({ where: { id, organisasiId } });
  if (!owner) return { error: "Akun tidak ditemukan atau bukan milik organisasi Anda" };

  const akun = await prisma.akun.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/akun");
  return { data: akun };
}

export async function deleteAkun(id: string) {
  const session = await auth();
  const organisasiId = getOrgId(session);
  if (!organisasiId) return { error: "Unauthorized" };

  try {
    const owner = await prisma.akun.findFirst({ where: { id, organisasiId } });
    if (!owner) return { error: "Akun tidak ditemukan atau bukan milik organisasi Anda" };

    await prisma.akun.delete({
      where: { id },
    });

    revalidatePath("/dashboard/akun");
    return { success: true };
  } catch (err: any) {
    if (err?.code === 'P2003') return { error: "Tidak dapat menghapus akun yang masih memiliki transaksi jurnal. Hapus transaksinya dulu." };
    return { error: "Gagal menghapus akun" };
  }
}

export async function importAkun(
  data: {
    kodeAkun: string;
    namaAkun: string;
    kategori: KategoriAkun;
    saldoNormal: SaldoNormal;
    deskripsi?: string;
  }[]
) {
  const session = await auth();
  const organisasiId = getOrgId(session);
  if (!organisasiId) return { error: "Unauthorized" };

  try {
    const existingAccounts = await prisma.akun.findMany({
      where: { organisasiId },
      select: { kodeAkun: true },
    });

    const existingKodes = new Set(existingAccounts.map((a) => a.kodeAkun));
    
    const toCreate = [];
    for (const item of data) {
      if (!existingKodes.has(item.kodeAkun)) {
        toCreate.push({
          ...item,
          organisasiId,
        });
        existingKodes.add(item.kodeAkun);
      }
    }

    if (toCreate.length > 0) {
      await prisma.akun.createMany({
        data: toCreate,
      });
      revalidatePath("/dashboard/akun");
    }

    return { imported: toCreate.length };
  } catch (err: any) {
    return { error: "Gagal mengimport data akun" };
  }
}
