"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getOrganisasiInfo() {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  
  if (!organisasiId) {
    return null;
  }

  const organisasi = await prisma.organisasi.findUnique({
    where: { id: organisasiId },
    select: {
      nama: true,
      alamat: true,
      telepon: true,
      email: true,
    }
  });

  return organisasi;
}
