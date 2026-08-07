"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getTokoPembelian() {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  return prisma.tokoPembelian.findMany({
    where: { organisasiId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTokoPembelian(data: {
  namaToko: string;
  alamat?: string;
  pemilikToko?: string;
  kontak?: string;
}) {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  await prisma.tokoPembelian.create({
    data: {
      ...data,
      organisasiId,
    },
  });

  revalidatePath("/dashboard/toko-pembelian");
}

export async function updateTokoPembelian(
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

  await prisma.tokoPembelian.update({
    where: { id, organisasiId },
    data,
  });

  revalidatePath("/dashboard/toko-pembelian");
}

export async function deleteTokoPembelian(id: string) {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  await prisma.tokoPembelian.delete({
    where: { id, organisasiId },
  });

  revalidatePath("/dashboard/toko-pembelian");
}
