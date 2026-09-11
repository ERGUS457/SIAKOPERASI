"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function getOrgId(session: any): string | null {
  return session?.organisasiId || session?.user?.organisasiId || null;
}

export async function getPengurus() {
  const session = await auth();
  const organisasiId = getOrgId(session);
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
  const organisasiId = getOrgId(session);
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
  const organisasiId = getOrgId(session);
  if (!organisasiId) throw new Error("Unauthorized");

  const owner = await prisma.pengurus.findFirst({ where: { id, organisasiId } });
  if (!owner) throw new Error("Data pengurus tidak ditemukan atau bukan milik organisasi Anda");

  await prisma.pengurus.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/pengurus");
}

export async function deletePengurus(id: string) {
  const session = await auth();
  const organisasiId = getOrgId(session);
  if (!organisasiId) throw new Error("Unauthorized");

  const owner = await prisma.pengurus.findFirst({ where: { id, organisasiId } });
  if (!owner) throw new Error("Data pengurus tidak ditemukan atau bukan milik organisasi Anda");

  await prisma.pengurus.delete({
    where: { id },
  });

  revalidatePath("/dashboard/pengurus");
}
