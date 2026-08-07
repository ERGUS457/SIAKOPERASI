import { prisma } from './src/lib/prisma';

async function main() {
  console.log('Fetching first organisasi...');
  const org = await prisma.organisasi.findFirst();
  if (!org) {
    console.log('No organisasi found. Register a user first.');
    return;
  }
  const orgId = org.id;

  const names = [
    "Budi Santoso", "Siti Aminah", "Ahmad Fauzi", "Dewi Lestari", "Andi Pratama",
    "Rina Yuliana", "Agus Setiawan", "Sri Wahyuni", "Hendra Gunawan", "Fitriani",
    "Eko Saputra", "Nurul Huda", "Rizki Aditya", "Dina Mariana", "Muhammad Yusuf",
    "Lina Marlina", "Irfan Hakim", "Maya Sari", "Rudi Hartono", "Anita Rahman"
  ];

  console.log('Generating 20 Anggota...');
  for (let i = 0; i < 20; i++) {
    const ts = Date.now() + i;
    await prisma.anggota.create({
      data: {
        nomorAnggota: `AGT-${ts}`,
        nama: names[i],
        alamat: `Jl. Anggota No. ${i + 1}, Jakarta`,
        telepon: `0812345678${i.toString().padStart(2, '0')}`,
        email: `anggota${i+1}@example.com`,
        organisasiId: orgId,
        simpanan: {
          create: {
            simpananPokok: 1000000,
            simpananWajib: 50000 * (i + 1),
            simpanan: 100000 * (i % 5),
          }
        }
      }
    });
  }

  const supplierNames = [
    "PT. Makmur Sentosa", "CV. Abadi Jaya", "UD. Rejeki Nomplok", "Toko Sinar Terang", "Grosir Maju Bersama",
    "PT. Distribusi Nasional", "CV. Berkah Utama", "Toko Sahabat", "UD. Lancar Jaya", "Mega Grosir",
    "PT. Pangan Lestari", "Toko Serba Ada", "CV. Cahaya Harapan", "UD. Tani Subur", "Grosir Murah",
    "PT. Sukses Bersama", "Toko Makmur", "CV. Bintang Terang", "UD. Harapan Baru", "Grosir Berkah"
  ];

  console.log('Generating 20 Toko Pembelian (Supplier)...');
  for (let i = 0; i < 20; i++) {
    await prisma.tokoPembelian.create({
      data: {
        namaToko: supplierNames[i],
        alamat: `Jl. Supplier No. ${i + 1}, Surabaya`,
        pemilikToko: `Pemilik ${i + 1}`,
        kontak: `0811122233${i.toString().padStart(2, '0')}`,
        organisasiId: orgId,
      }
    });
  }

  const customerNames = [
    "Toko Kelontong Budi", "Warung Mpok Ipeh", "Koperasi Karyawan X", "Minimarket Segar", "Toko Bangunan Jaya",
    "Warung Nasi Uduk", "Apotek Sehat", "Toko Pakaian Murah", "Bengkel Motor Berkah", "Toko Elektronik Sinar",
    "Kantin Sekolah Y", "Warung Kopi Mantap", "Toko Alat Tulis", "Toko Buah Segar", "Toko Kue Enak",
    "Warung Makan Padang", "Toko Perabotan", "Toko Mainan Anak", "Toko Sepatu Bagus", "Toko Sepeda"
  ];

  console.log('Generating 20 Toko Penjualan (Customer)...');
  for (let i = 0; i < 20; i++) {
    await prisma.tokoPenjualan.create({
      data: {
        namaToko: customerNames[i],
        alamat: `Jl. Customer No. ${i + 1}, Bandung`,
        pemilikToko: `Customer ${i + 1}`,
        kontak: `0822233344${i.toString().padStart(2, '0')}`,
        organisasiId: orgId,
      }
    });
  }
  
  console.log('Seed dummy data finished!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
