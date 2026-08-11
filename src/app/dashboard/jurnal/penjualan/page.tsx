import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientPage from "./client";

export default async function Page() {
  const session = await auth();
  if (!session?.user?.organisasiId) redirect("/login");
  const organisasiId = session.user.organisasiId;

  const akunOptions = await prisma.akun.findMany({
    where: { organisasiId },
    orderBy: { kodeAkun: 'asc' }
  });

  const tokoPenjualan = await prisma.tokoPenjualan.findMany({ where: { organisasiId } });
  const anggota = await prisma.anggota.findMany({ where: { organisasiId } });

  const transaksi = await prisma.transaksi.findMany({
    where: { 
      organisasiId,
      jenisJurnal: "PENJUALAN"
    },
    include: {
      detailJurnal: true
    },
    orderBy: {
      tanggal: 'desc'
    }
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Penjualan</h1>
      <ClientPage 
        akunOptions={akunOptions}
        tokoPenjualan={tokoPenjualan}
        anggota={anggota}
        transaksi={transaksi}
      />
    </div>
  );
}
