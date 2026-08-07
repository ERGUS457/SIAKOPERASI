import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import JurnalClient from "./client";

export default async function JurnalPage() {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;

  if (!organisasiId) {
    return <div>Unauthorized</div>;
  }

  // Fetch all transactions for this organization, ordered by date descending
  const transaksiList = await prisma.transaksi.findMany({
    where: { organisasiId },
    orderBy: {
      tanggal: 'desc'
    },
    include: {
      tokoPembelian: true,
      tokoPenjualan: true,
      anggota: true,
      detailJurnal: {
        include: {
          akun: true
        }
      }
    }
  });

  // Calculate total debit for each transaction (since debit = kredit)
  const formattedData = transaksiList.map((t) => {
    const totalNominal = t.detailJurnal
      .filter((d) => d.posisi === 'DEBIT')
      .reduce((sum, d) => sum + d.nominal, 0);

    let sumber = "-";
    if (t.tokoPembelian) sumber = `Pemasok: ${t.tokoPembelian.namaToko}`;
    if (t.tokoPenjualan) sumber = `Pelanggan: ${t.tokoPenjualan.namaToko}`;
    if (t.anggota) sumber = `Anggota: ${t.anggota.nama}`;

    return {
      id: t.id,
      nomorTransaksi: t.nomorTransaksi,
      tanggal: t.tanggal,
      jenisJurnal: t.jenisJurnal,
      keterangan: t.keterangan,
      sumber,
      totalNominal,
      detailJurnal: t.detailJurnal
    };
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Riwayat Jurnal Transaksi</h2>
      </div>
      <JurnalClient data={formattedData} />
    </div>
  );
}
