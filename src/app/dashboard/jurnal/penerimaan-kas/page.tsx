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

  const tokoPembelian = await prisma.tokoPembelian.findMany({ where: { organisasiId } });
  const tokoPenjualan = await prisma.tokoPenjualan.findMany({ where: { organisasiId } });
  const anggota = await prisma.anggota.findMany({ where: { organisasiId } });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Penerimaan Kas</h1>
      <ClientPage 
        akunOptions={akunOptions}
        tokoPembelian={tokoPembelian}
        tokoPenjualan={tokoPenjualan}
        anggota={anggota}
      />
    </div>
  );
}
