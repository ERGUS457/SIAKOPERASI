import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AkunClient from "./client";

export const metadata = {
  title: "Chart of Accounts | Dashboard",
  description: "Manajemen Chart of Accounts",
};
export default async function AkunPage() {
  const session = await auth() as any;
  const organisasiId = session?.organisasiId || session?.user?.organisasiId;
  if (!organisasiId) {
    redirect("/login");
  }

  const akunList = await prisma.akun.findMany({
    where: {
      organisasiId,
    },
    orderBy: {
      kodeAkun: "asc",
    },
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Daftar Akun (COA)</h2>
      </div>
      <AkunClient initialData={akunList} />
    </div>
  );
}
