import { prisma } from './src/lib/prisma';

async function main() {
  console.log('Starting backfill for Simpanan...');
  
  // Find all Anggota that do not have a Simpanan record
  const anggotaTanpaSimpanan = await prisma.anggota.findMany({
    where: {
      simpanan: null
    }
  });

  console.log(`Found ${anggotaTanpaSimpanan.length} Anggota without Simpanan.`);

  for (const anggota of anggotaTanpaSimpanan) {
    console.log(`Creating Simpanan for Anggota ${anggota.nama} (${anggota.id})`);
    await prisma.simpanan.create({
      data: {
        anggotaId: anggota.id
      }
    });
  }

  console.log('Backfill completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
