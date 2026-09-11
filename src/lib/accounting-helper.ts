import { prisma } from "@/lib/prisma";
import { KategoriAkun, SaldoNormal } from "@prisma/client";

export async function getOrCreateDefaultAkun(
  organisasiId: string,
  type: 'KAS' | 'SIMPANAN_POKOK' | 'SIMPANAN_WAJIB' | 'SIMPANAN_SUKARELA' | 'PIUTANG_ANGGOTA' | 'PENDAPATAN_BUNGA',
  tx?: any
) {
  const db: any = tx || prisma;
  let searchName = '';
  let defaultKode = '';
  let kategori: KategoriAkun = KategoriAkun.ASET_LANCAR;
  let saldoNormal: SaldoNormal = SaldoNormal.DEBIT;

  switch (type) {
    case 'KAS':
      searchName = 'Kas';
      defaultKode = '1-1001';
      kategori = KategoriAkun.ASET_LANCAR;
      saldoNormal = SaldoNormal.DEBIT;
      break;
    case 'PIUTANG_ANGGOTA':
      searchName = 'Piutang Anggota';
      defaultKode = '1-1002';
      kategori = KategoriAkun.ASET_LANCAR;
      saldoNormal = SaldoNormal.DEBIT;
      break;
    case 'SIMPANAN_POKOK':
      searchName = 'Simpanan Pokok';
      defaultKode = '3-1001';
      kategori = KategoriAkun.MODAL;
      saldoNormal = SaldoNormal.KREDIT;
      break;
    case 'SIMPANAN_WAJIB':
      searchName = 'Simpanan Wajib';
      defaultKode = '3-1002';
      kategori = KategoriAkun.MODAL;
      saldoNormal = SaldoNormal.KREDIT;
      break;
    case 'SIMPANAN_SUKARELA':
      searchName = 'Simpanan Sukarela';
      defaultKode = '2-2001';
      kategori = KategoriAkun.KEWAJIBAN_JANGKA_PENDEK;
      saldoNormal = SaldoNormal.KREDIT;
      break;
    case 'PENDAPATAN_BUNGA':
      searchName = 'Pendapatan Bunga Pinjaman';
      defaultKode = '4-1001';
      kategori = KategoriAkun.PENDAPATAN;
      saldoNormal = SaldoNormal.KREDIT;
      break;
  }

  let akun = await db.akun.findFirst({
    where: { 
      organisasiId,
      namaAkun: { contains: searchName, mode: 'insensitive' }
    }
  });

  if (akun) return akun;

  let uniqueKode = defaultKode;
  let exists = await db.akun.findUnique({
    where: { kodeAkun_organisasiId: { kodeAkun: uniqueKode, organisasiId } }
  });
  
  if (exists) {
    uniqueKode = `${defaultKode}-${Math.floor(Math.random() * 1000)}`;
  }

  akun = await db.akun.create({
    data: {
      kodeAkun: uniqueKode,
      namaAkun: searchName,
      kategori,
      saldoNormal,
      organisasiId
    }
  });

  return akun;
}
