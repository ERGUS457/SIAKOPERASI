import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PinjamanClient from "./client";

export default async function PinjamanPage() {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;

  if (!organisasiId) {
    return <div>Unauthorized</div>;
  }

  const pinjaman = await prisma.pinjaman.findMany({
    where: {
      anggota: {
        organisasiId,
      },
    },
    include: {
      anggota: true,
    },
  });

  const anggotaList = await prisma.anggota.findMany({
    where: { organisasiId },
    select: { id: true, nama: true }
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Pinjaman</h2>
      </div>
      <PinjamanClient data={pinjaman} anggotaList={anggotaList} />
    </div>
  );
}
