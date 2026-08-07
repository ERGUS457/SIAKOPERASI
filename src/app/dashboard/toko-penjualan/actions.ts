"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getTokoPenjualan() {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
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
  const organisasiId = (session as any)?.organisasiId;
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
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  await prisma.tokoPenjualan.update({
    where: { id, organisasiId },
    data,
  });

  revalidatePath("/dashboard/toko-penjualan");
}

export async function deleteTokoPenjualan(id: string) {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  await prisma.tokoPenjualan.delete({
    where: { id, organisasiId },
  });

  revalidatePath("/dashboard/toko-penjualan");
}
