import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PerubahanModalClient from "./client";

export default async function PerubahanModalPage({
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

  // Fetch modal accounts
  const modalAkun = await prisma.akun.findMany({
    where: { organisasiId, kategori: "MODAL" },
    include: {
      detailJurnal: {
        where: {
          transaksi: {
            organisasiId,
            ...(Object.keys(dateFilter).length > 0 ? { tanggal: dateFilter } : {}),
          },
        },
        include: {
          transaksi: true
        }
      },
    },
    orderBy: { kodeAkun: "asc" },
  });

  // Fetch laba rugi
  const allAkun = await prisma.akun.findMany({
    where: { organisasiId, kategori: { in: ["PENDAPATAN", "BEBAN"] } },
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
  });

  const totalPendapatan = allAkun
    .filter(a => a.kategori === "PENDAPATAN")
    .reduce((sum, a) => {
      const d = a.detailJurnal.reduce((s, dj) => dj.posisi === "DEBIT" ? s - dj.nominal : s + dj.nominal, 0);
      return sum + d;
    }, 0);

  const totalBeban = allAkun
    .filter(a => a.kategori === "BEBAN")
    .reduce((sum, a) => {
      const d = a.detailJurnal.reduce((s, dj) => dj.posisi === "DEBIT" ? s + dj.nominal : s - dj.nominal, 0);
      return sum + d;
    }, 0);

  const labaBersih = totalPendapatan - totalBeban;

  const modalData = modalAkun.map(akun => {
    let totalDebit = 0;
    let totalKredit = 0;
    akun.detailJurnal.forEach(dj => {
      if (dj.posisi === "DEBIT") totalDebit += dj.nominal;
      else totalKredit += dj.nominal;
    });

    return {
      id: akun.id,
      kodeAkun: akun.kodeAkun,
      namaAkun: akun.namaAkun,
      saldoAwal: 0, // We don't have opening balance separately in this schema
      penambahan: totalKredit,
      pengurangan: totalDebit,
      saldoAkhir: totalKredit - totalDebit,
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Laporan Perubahan Modal</h1>
        <p className="text-muted-foreground">
          Laporan perubahan ekuitas/modal koperasi.
        </p>
      </div>
      <PerubahanModalClient
        modalData={modalData}
        labaBersih={labaBersih}
        initialParams={{ startDate, endDate }}
      />
    </div>
  );
}
