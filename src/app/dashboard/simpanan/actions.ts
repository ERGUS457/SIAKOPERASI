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

  // Calculate differences
  const diffPokok = (Number(data.simpananPokok) || 0) - existing.simpananPokok;
  const diffWajib = (Number(data.simpananWajib) || 0) - existing.simpananWajib;
  const diffSukarela = (Number(data.simpanan) || 0) - existing.simpanan;

  // Perform updates inside a transaction to ensure atomic operations
  await prisma.$transaction(async (tx) => {
    // 1. Update Simpanan balances
    await tx.simpanan.update({
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

    // 2. Helper for creating transaction journal
    const createJurnal = async (diff: number, type: 'SIMPANAN_POKOK' | 'SIMPANAN_WAJIB' | 'SIMPANAN_SUKARELA', label: string) => {
      if (diff === 0) return;

      const { getOrCreateDefaultAkun } = await import("@/lib/accounting-helper");
      const akunKas = await getOrCreateDefaultAkun(organisasiId, 'KAS');
      const akunSimpanan = await getOrCreateDefaultAkun(organisasiId, type);

      const isPenerimaan = diff > 0;
      const nominal = Math.abs(diff);

      const nomorTransaksi = `JU-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;

      await tx.transaksi.create({
        data: {
          nomorTransaksi,
          tanggal: new Date(),
          jenisJurnal: isPenerimaan ? 'PENERIMAAN_KAS' : 'PENGELUARAN_KAS',
          keterangan: `${isPenerimaan ? 'Penerimaan' : 'Penarikan'} ${label} dari Anggota`,
          organisasiId,
          anggotaId: existing.anggotaId,
          detailJurnal: {
            create: [
              {
                akunId: akunKas.id,
                posisi: isPenerimaan ? 'DEBIT' : 'KREDIT',
                nominal,
                keterangan: label
              },
              {
                akunId: akunSimpanan.id,
                posisi: isPenerimaan ? 'KREDIT' : 'DEBIT',
                nominal,
                keterangan: label
              }
            ]
          }
        }
      });
    };

    // 3. Trigger journals
    await createJurnal(diffPokok, 'SIMPANAN_POKOK', 'Simpanan Pokok');
    await createJurnal(diffWajib, 'SIMPANAN_WAJIB', 'Simpanan Wajib');
    await createJurnal(diffSukarela, 'SIMPANAN_SUKARELA', 'Simpanan Sukarela');
  });

  revalidatePath('/dashboard/simpanan');
}
