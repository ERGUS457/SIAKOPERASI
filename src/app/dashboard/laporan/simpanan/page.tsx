import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LaporanSimpananClient from "./client";

export const metadata = {
  title: "Laporan Simpanan - SIA Koperasi",
};

export default async function LaporanSimpananPage() {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;

  if (!organisasiId) {
    return <div>Unauthorized</div>;
  }

  // Fetch all Simpanan with Anggota details
  const simpanan = await prisma.simpanan.findMany({
    where: {
      anggota: {
        organisasiId,
      },
    },
    include: {
      anggota: true,
    },
    orderBy: {
      anggota: {
        nama: 'asc'
      }
    }
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Laporan Simpanan Anggota</h2>
      </div>
      <LaporanSimpananClient data={simpanan} />
    </div>
  );
}
