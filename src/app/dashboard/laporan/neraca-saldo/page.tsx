import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NeracaSaldoClient from "./client";

export default async function NeracaSaldoPage({
  searchParams,
}: {
  searchParams: { startDate?: string; endDate?: string };
}) {
  const session = await auth();
  if (!session?.user?.organisasiId) redirect("/login");
  const organisasiId = session.user.organisasiId;

  const { startDate, endDate } = searchParams;

  const dateFilter: any = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }

  const akunList = await prisma.akun.findMany({
    where: { organisasiId },
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

  const neracaSaldo = akunList.map((akun) => {
    let totalDebit = 0;
    let totalKredit = 0;

    akun.detailJurnal.forEach((dj) => {
      if (dj.posisi === "DEBIT") totalDebit += dj.nominal;
      else totalKredit += dj.nominal;
    });

    const net = totalDebit - totalKredit;
    let debit = 0;
    let kredit = 0;

    if (net > 0) debit = net;
    else if (net < 0) kredit = Math.abs(net);

    return {
      id: akun.id,
      kodeAkun: akun.kodeAkun,
      namaAkun: akun.namaAkun,
      debit,
      kredit,
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Neraca Saldo</h1>
        <p className="text-muted-foreground">
          Laporan saldo akhir semua akun (trial balance).
        </p>
      </div>

      <NeracaSaldoClient
        neracaSaldo={neracaSaldo}
        initialParams={{ startDate, endDate }}
      />
    </div>
  );
}
