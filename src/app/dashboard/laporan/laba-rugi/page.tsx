import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LabaRugiClient from "./client";

export default async function LabaRugiPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organisasiId) redirect("/login");
  const organisasiId = session.user.organisasiId;

  const params = await searchParams;
  const startDate = params?.startDate;
  const endDate = params?.endDate;

  const dateFilter: any = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }

  const akunList = await prisma.akun.findMany({
    where: { 
      organisasiId,
      kategori: { in: ["PENDAPATAN", "BEBAN"] }
    },
    include: {
      detailJurnal: {
        where: {
          transaksi: {
            organisasiId,
            ...(Object.keys(dateFilter).length > 0 ? { tanggal: dateFilter } : {}),
          },
        },
      },
    },
    orderBy: { kodeAkun: "asc" },
  });

  const pendapatan = akunList
    .filter((a) => a.kategori === "PENDAPATAN")
    .map((akun) => {
      let totalDebit = 0;
      let totalKredit = 0;
      akun.detailJurnal.forEach((dj) => {
        if (dj.posisi === "DEBIT") totalDebit += dj.nominal;
        else totalKredit += dj.nominal;
      });
      return {
        ...akun,
        saldo: totalKredit - totalDebit,
      };
    })
    .filter((a) => a.saldo !== 0);

  const beban = akunList
    .filter((a) => a.kategori === "BEBAN")
    .map((akun) => {
      let totalDebit = 0;
      let totalKredit = 0;
      akun.detailJurnal.forEach((dj) => {
        if (dj.posisi === "DEBIT") totalDebit += dj.nominal;
        else totalKredit += dj.nominal;
      });
      return {
        ...akun,
        saldo: totalDebit - totalKredit,
      };
    })
    .filter((a) => a.saldo !== 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Laba Rugi</h1>
        <p className="text-muted-foreground">
          Laporan pendapatan dan beban (income statement).
        </p>
      </div>

      <LabaRugiClient
        pendapatan={pendapatan}
        beban={beban}
        initialParams={{ startDate, endDate }}
      />
    </div>
  );
}
