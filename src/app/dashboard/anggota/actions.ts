"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getAnggota() {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  return prisma.anggota.findMany({
    where: { organisasiId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAnggota(data: {
  nomorAnggota: string;
  nama: string;
  alamat?: string;
  telepon?: string;
  email?: string;
}) {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  await prisma.anggota.create({
    data: {
      ...data,
      organisasiId,
      simpanan: {
        create: {}, // Creates an empty simpanan record with default values
      },
    },
  });

  revalidatePath("/dashboard/anggota");
}

export async function updateAnggota(
  id: string,
  data: {
    nomorAnggota: string;
    nama: string;
    alamat?: string;
    telepon?: string;
    email?: string;
  }
) {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  await prisma.anggota.update({
    where: { id, organisasiId },
    data,
  });

  revalidatePath("/dashboard/anggota");
}

export async function deleteAnggota(id: string) {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  if (!organisasiId) throw new Error("Unauthorized");

  await prisma.anggota.delete({
    where: { id, organisasiId },
  });

  revalidatePath("/dashboard/anggota");
}
