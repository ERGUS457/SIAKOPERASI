"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function getOrgId(session: any): string | null {
  return session?.organisasiId || session?.user?.organisasiId || null;
}

export async function getTokoPenjualan() {
  const session = await auth();
  const organisasiId = getOrgId(session);
  if (!organisasiId) throw new Error("Unauthorized");

  return prisma.tokoPenjualan.findMany({
    where: { organisasiId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTokoPenjualan(data: {
  namaToko: string;
  alamat?: string;
  pemilikToko?: string;
  kontak?: string;
}) {
  const session = await auth();
  const organisasiId = getOrgId(session);
  if (!organisasiId) throw new Error("Unauthorized");

  await prisma.tokoPenjualan.create({
    data: {
      ...data,
      organisasiId,
    },
  });

  revalidatePath("/dashboard/toko-penjualan");
}

export async function updateTokoPenjualan(
  id: string,
  data: {
    namaToko: string;
    alamat?: string;
    pemilikToko?: string;
    kontak?: string;
  }
) {
  const session = await auth();
  const organisasiId = getOrgId(session);
  if (!organisasiId) throw new Error("Unauthorized");

  const owner = await prisma.tokoPenjualan.findFirst({ where: { id, organisasiId } });
  if (!owner) throw new Error("Data toko tidak ditemukan atau bukan milik organisasi Anda");

  await prisma.tokoPenjualan.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/toko-penjualan");
}

export async function deleteTokoPenjualan(id: string) {
  const session = await auth();
  const organisasiId = getOrgId(session);
  if (!organisasiId) throw new Error("Unauthorized");

  const owner = await prisma.tokoPenjualan.findFirst({ where: { id, organisasiId } });
  if (!owner) throw new Error("Data toko tidak ditemukan atau bukan milik organisasi Anda");

  await prisma.tokoPenjualan.delete({
    where: { id },
  });

  revalidatePath("/dashboard/toko-penjualan");
}
