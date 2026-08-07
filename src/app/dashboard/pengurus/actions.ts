"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getPengurus() {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  return prisma.pengurus.findMany({
    where: { organisasiId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPengurus(data: {
  nama: string;
  jabatan: string;
  alamat?: string;
  telepon?: string;
  email?: string;
}) {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  await prisma.pengurus.create({
    data: {
      ...data,
      organisasiId,
    },
  });

  revalidatePath("/dashboard/pengurus");
}

export async function updatePengurus(
  id: string,
  data: {
    nama: string;
    jabatan: string;
    alamat?: string;
    telepon?: string;
    email?: string;
  }
) {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  await prisma.pengurus.update({
    where: { id, organisasiId },
    data,
  });

  revalidatePath("/dashboard/pengurus");
}

export async function deletePengurus(id: string) {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  await prisma.pengurus.delete({
    where: { id, organisasiId },
  });

  revalidatePath("/dashboard/pengurus");
}
