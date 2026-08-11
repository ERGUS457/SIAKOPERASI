"use server";

import { submitJurnal as submitPenerimaan } from "@/app/dashboard/jurnal/penerimaan-kas/actions";
import { submitJurnal as submitPengeluaran } from "@/app/dashboard/jurnal/pengeluaran-kas/actions";
import { revalidatePath } from "next/cache";

export async function quickSimpananTransaction(data: {
  jenisTransaksi: "SETOR" | "TARIK";
  anggotaId: string;
  akunKasId: string;
  akunSimpananId: string;
  nominal: number;
  keterangan: string;
  tanggal: string;
}) {
  
  if (data.jenisTransaksi === "SETOR") {
    // Setor = Penerimaan Kas
    // Kas bertambah (Debit), Simpanan bertambah (Kredit)
    await submitPenerimaan({
      tanggal: data.tanggal,
      keterangan: data.keterangan || "Setoran Simpanan",
      akunKasId: data.akunKasId,
      sumberType: "ANGGOTA",
      sumberId: data.anggotaId,
      kreditRows: [
        {
          akunId: data.akunSimpananId,
          nominal: data.nominal,
          keterangan: data.keterangan || "Setoran Simpanan",
        }
      ]
    });
  } else {
    // Tarik = Pengeluaran Kas
    // Kas berkurang (Kredit), Simpanan berkurang (Debit)
    await submitPengeluaran({
      tanggal: data.tanggal,
      keterangan: data.keterangan || "Penarikan Simpanan",
      akunKasId: data.akunKasId,
      sumberType: "ANGGOTA",
      sumberId: data.anggotaId,
      debitRows: [
        {
          akunId: data.akunSimpananId,
          nominal: data.nominal,
          keterangan: data.keterangan || "Penarikan Simpanan",
        }
      ]
    });
  }

  revalidatePath('/dashboard/simpanan');
  revalidatePath('/dashboard/jurnal/penerimaan-kas');
  revalidatePath('/dashboard/jurnal/pengeluaran-kas');
}
