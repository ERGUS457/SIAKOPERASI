import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BukuBesarClient from "./client";

export default async function BukuBesarPage({
  searchParams,
}: {
  searchParams: Promise<{ akunId?: string; startDate?: string; endDate?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organisasiId) redirect("/login");
  const organisasiId = session.user.organisasiId;

  const akunList = await prisma.akun.findMany({
    where: { organisasiId },
    orderBy: { kodeAkun: "asc" },
  });

  const params = await searchParams;
  const akunId = params?.akunId;
  const startDate = params?.startDate;
  const endDate = params?.endDate;
  let detailJurnal: any[] = [];
  let akunSelected = null;
  let saldoAwal = 0;

  if (akunId) {
    akunSelected = akunList.find((a) => a.id === akunId) || null;

    if (akunSelected) {
      if (startDate) {
        const priorEntries = await prisma.detailJurnal.findMany({
          where: {
            akunId,
            transaksi: {
              organisasiId,
              tanggal: { lt: new Date(startDate) },
            },
          },
        });
        
        let priorDebit = 0;
        let priorKredit = 0;
        priorEntries.forEach((e) => {
          if (e.posisi === "DEBIT") priorDebit += e.nominal;
          else priorKredit += e.nominal;
        });
        
        saldoAwal =
          akunSelected.saldoNormal === "DEBIT"
            ? priorDebit - priorKredit
            : priorKredit - priorDebit;
      }

      const dateFilter: any = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }

      detailJurnal = await prisma.detailJurnal.findMany({
        where: {
          akunId,
          transaksi: {
            organisasiId,
            ...(Object.keys(dateFilter).length > 0 ? { tanggal: dateFilter } : {}),
          },
        },
        include: {
          transaksi: true,
        },
        orderBy: [
          {
            transaksi: {
              tanggal: "asc",
            },
          },
          {
            createdAt: "asc"
          }
        ],
      });
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Buku Besar</h1>
        <p className="text-muted-foreground">
          Laporan rincian mutasi setiap akun (buku besar).
        </p>
      </div>

      <BukuBesarClient
        akunList={akunList}
        detailJurnal={detailJurnal}
        akunSelected={akunSelected}
        saldoAwal={saldoAwal}
        initialParams={{ akunId, startDate, endDate }}
      />
    </div>
  );
}
