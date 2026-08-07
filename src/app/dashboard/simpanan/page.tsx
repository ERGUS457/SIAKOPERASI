import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SimpananClient from "./client";

export default async function SimpananPage() {
  const session = await auth();
  const organisasiId = (session as any)?.organisasiId;

  if (!organisasiId) {
    return <div>Unauthorized</div>;
  }

  const simpanan = await prisma.simpanan.findMany({
    where: {
      anggota: {
        organisasiId,
      },
    },
    include: {
      anggota: true,
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Simpanan</h2>
      </div>
      <SimpananClient data={simpanan} />
    </div>
  );
}
