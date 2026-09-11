"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function getOrgId(session: any): string | null {
  return session?.organisasiId || session?.user?.organisasiId || null;
}

export async function getTokoPembelian() {
  const session = await auth();
  const organisasiId = getOrgId(session);
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
  const organisasiId = getOrgId(session);
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
  const organisasiId = getOrgId(session);
  if (!organisasiId) throw new Error("Unauthorized");

  const owner = await prisma.tokoPembelian.findFirst({ where: { id, organisasiId } });
  if (!owner) throw new Error("Data toko tidak ditemukan atau bukan milik organisasi Anda");

  await prisma.tokoPembelian.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/toko-pembelian");
}

export async function deleteTokoPembelian(id: string) {
  const session = await auth();
  const organisasiId = getOrgId(session);
  if (!organisasiId) throw new Error("Unauthorized");

  const owner = await prisma.tokoPembelian.findFirst({ where: { id, organisasiId } });
  if (!owner) throw new Error("Data toko tidak ditemukan atau bukan milik organisasi Anda");

  await prisma.tokoPembelian.delete({
    where: { id },
  });

  revalidatePath("/dashboard/toko-pembelian");
}
