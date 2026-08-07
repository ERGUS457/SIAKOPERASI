'use server'

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSimpanan(id: string, data: any) {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;
  
  if (!organisasiId) throw new Error("Unauthorized");
  
  const existing = await prisma.simpanan.findFirst({
    where: { 
        id,
        anggota: {
            organisasiId
        }
    }
  });

  if (!existing) throw new Error("Not found");

  await prisma.simpanan.update({
    where: { id },
    data: {
      simpananPokok: Number(data.simpananPokok) || 0,
      simpananWajib: Number(data.simpananWajib) || 0,
      simpanan: Number(data.simpanan) || 0,
      tambahanModal: Number(data.tambahanModal) || 0,
      simpananSukarela: Number(data.simpananSukarela) || 0,
      simpanan1: Number(data.simpanan1) || 0,
      simpanan2: Number(data.simpanan2) || 0,
    }
  });

  revalidatePath('/dashboard/simpanan');
}
