"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function getOrgId(session: any): string | null {
  return session?.organisasiId || session?.user?.organisasiId || null;
}

export async function getAnggota() {
  const session = await auth();
  const organisasiId = getOrgId(session);
  if (!organisasiId) throw new Error("Unauthorized");

  return prisma.anggota.findMany({
    where: { organisasiId },
    include: {
      transaksi: {
        include: { detailJurnal: { include: { akun: true } } },
        orderBy: { tanggal: 'desc' }
      }
    },
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
  const organisasiId = getOrgId(session);
  if (!organisasiId) throw new Error("Unauthorized");

  await prisma.anggota.create({
    data: {
      ...data,
      organisasiId,
      simpanan: {
        create: {},
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
  const organisasiId = getOrgId(session);
  if (!organisasiId) throw new Error("Unauthorized");

  const owner = await prisma.anggota.findFirst({ where: { id, organisasiId } });
  if (!owner) throw new Error("Anggota tidak ditemukan atau bukan milik organisasi Anda");

  await prisma.anggota.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/anggota");
}

export async function deleteAnggota(id: string) {
  const session = await auth();
  const organisasiId = getOrgId(session);
  if (!organisasiId) throw new Error("Unauthorized");

  const owner = await prisma.anggota.findFirst({ where: { id, organisasiId } });
  if (!owner) throw new Error("Anggota tidak ditemukan atau bukan milik organisasi Anda");

  await prisma.anggota.delete({
    where: { id },
  });

  revalidatePath("/dashboard/anggota");
}
