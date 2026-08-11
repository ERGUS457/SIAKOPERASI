import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const anggotaList = await prisma.anggota.findMany({
    include: {
      transaksi: {
        include: {
          detailJurnal: {
            include: { akun: true }
          }
        }
      },
      simpanan: true
    }
  })

  for (const anggota of anggotaList) {
    if (!anggota.simpanan) continue;

    let totalPokok = 0;
    let totalWajib = 0;
    let totalSukarela = 0;

    for (const t of anggota.transaksi) {
      for (const dj of t.detailJurnal) {
        const nama = dj.akun.namaAkun.toLowerCase();
        if (nama.includes('simpanan')) {
          let nominal = dj.nominal;
          // Saldo normal MODAL = KREDIT (Kredit bertambah, Debit berkurang)
          if (dj.posisi === 'DEBIT') nominal = -nominal;

          if (nama.includes('pokok')) totalPokok += nominal;
          else if (nama.includes('wajib')) totalWajib += nominal;
          else if (nama.includes('sukarela')) totalSukarela += nominal;
        }
      }
    }

    console.log(`Anggota: ${anggota.nama}, Pokok: ${totalPokok}, Wajib: ${totalWajib}, Sukarela: ${totalSukarela}`);

    // Assuming we want to override with computed values to fix any discrepancies
    await prisma.simpanan.update({
      where: { anggotaId: anggota.id },
      data: {
        simpananPokok: totalPokok,
        simpananWajib: totalWajib,
        simpananSukarela: totalSukarela
      }
    })
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
