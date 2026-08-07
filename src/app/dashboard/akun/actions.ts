"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { KategoriAkun, SaldoNormal } from "@prisma/client";

export async function createAkun(data: {
  kodeAkun: string;
  namaAkun: string;
  kategori: KategoriAkun;
  saldoNormal: SaldoNormal;
  deskripsi?: string;
}) {
  const session = await auth();
  if (!session?.organisasiId) throw new Error("Unauthorized");

  // Validate kodeAkun is unique
  const existing = await prisma.akun.findFirst({
    where: {
      kodeAkun: data.kodeAkun,
      organisasiId: session.organisasiId,
    },
  });

  if (existing) {
    throw new Error("Kode Akun sudah digunakan");
  }

  const akun = await prisma.akun.create({
    data: {
      ...data,
      organisasiId: session.organisasiId,
    },
  });

  revalidatePath("/dashboard/akun");
  return akun;
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
  if (!session?.organisasiId) throw new Error("Unauthorized");

  // Validate unique kodeAkun if changed
  const existing = await prisma.akun.findFirst({
    where: {
      kodeAkun: data.kodeAkun,
      organisasiId: session.organisasiId,
      NOT: { id },
    },
  });

  if (existing) {
    throw new Error("Kode Akun sudah digunakan");
  }

  const akun = await prisma.akun.update({
    where: {
      id,
      organisasiId: session.organisasiId,
    },
    data,
  });

  revalidatePath("/dashboard/akun");
  return akun;
}

export async function deleteAkun(id: string) {
  const session = await auth();
  if (!session?.organisasiId) throw new Error("Unauthorized");

  await prisma.akun.delete({
    where: {
      id,
      organisasiId: session.organisasiId,
    },
  });

  revalidatePath("/dashboard/akun");
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
  if (!session?.organisasiId) throw new Error("Unauthorized");

  // Get all existing accounts to avoid duplicates in this transaction
  const existingAccounts = await prisma.akun.findMany({
    where: { organisasiId: session.organisasiId },
    select: { kodeAkun: true },
  });

  const existingKodes = new Set(existingAccounts.map((a) => a.kodeAkun));
  
  const toCreate = [];
  for (const item of data) {
    if (!existingKodes.has(item.kodeAkun)) {
      toCreate.push({
        ...item,
        organisasiId: session.organisasiId,
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
}
