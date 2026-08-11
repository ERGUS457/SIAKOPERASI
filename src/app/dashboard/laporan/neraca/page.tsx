import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NeracaClient from "./client";

export default async function NeracaPage({
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

  const processedAkun = akunList.map((akun) => {
    let totalDebit = 0;
    let totalKredit = 0;
    akun.detailJurnal.forEach((dj) => {
      if (dj.posisi === "DEBIT") totalDebit += dj.nominal;
      else totalKredit += dj.nominal;
    });

    let saldo = 0;
    // Aset dan Beban bersaldo normal DEBIT
    if (
      akun.kategori === "ASET_LANCAR" ||
      akun.kategori === "ASET_TETAP" ||
      akun.kategori === "BEBAN"
    ) {
      saldo = totalDebit - totalKredit;
    } else {
      // Kewajiban, Modal, Pendapatan bersaldo normal KREDIT
      saldo = totalKredit - totalDebit;
    }

    return {
      ...akun,
      saldo,
    };
  });

  const asetLancar = processedAkun.filter((a) => a.kategori === "ASET_LANCAR" && a.saldo !== 0);
  const asetTetap = processedAkun.filter((a) => a.kategori === "ASET_TETAP" && a.saldo !== 0);
  
  const kewajibanPendek = processedAkun.filter(
    (a) => a.kategori === "KEWAJIBAN_JANGKA_PENDEK" && a.saldo !== 0
  );
  const kewajibanPanjang = processedAkun.filter(
    (a) => a.kategori === "KEWAJIBAN_JANGKA_PANJANG" && a.saldo !== 0
  );
  
  const modal = processedAkun.filter((a) => a.kategori === "MODAL" && a.saldo !== 0);

  // Hitung Laba/Rugi Bersih
  const pendapatan = processedAkun.filter((a) => a.kategori === "PENDAPATAN");
  const beban = processedAkun.filter((a) => a.kategori === "BEBAN");
  
  const totalPendapatan = pendapatan.reduce((sum, item) => sum + item.saldo, 0);
  const totalBeban = beban.reduce((sum, item) => sum + item.saldo, 0);
  const labaBersih = totalPendapatan - totalBeban;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Neraca</h1>
        <p className="text-muted-foreground">
          Laporan posisi keuangan (balance sheet).
        </p>
      </div>

      <NeracaClient
        asetLancar={asetLancar}
        asetTetap={asetTetap}
        kewajibanPendek={kewajibanPendek}
        kewajibanPanjang={kewajibanPanjang}
        modal={modal}
        labaBersih={labaBersih}
        initialParams={{ startDate, endDate }}
      />
    </div>
  );
}
