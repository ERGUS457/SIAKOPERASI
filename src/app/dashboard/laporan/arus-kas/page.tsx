import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArusKasClient from "./client";

export default async function ArusKasPage({
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

  // Fetch all relevant accounts with their journal entries
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

  // Helper to calculate net balance for an account
  const getNetBalance = (akun: any, normalSide: "DEBIT" | "KREDIT") => {
    let totalDebit = 0;
    let totalKredit = 0;
    akun.detailJurnal.forEach((dj: any) => {
      if (dj.posisi === "DEBIT") totalDebit += dj.nominal;
      else totalKredit += dj.nominal;
    });
    if (normalSide === "DEBIT") return totalDebit - totalKredit;
    return totalKredit - totalDebit;
  };

  // === ARUS KAS OPERASI ===
  // Kas masuk: Pendapatan, Penerimaan Simpanan
  const akunKas = akunList.filter(a =>
    a.kategori === "ASET_LANCAR" && (a.namaAkun.toLowerCase().includes("kas") || a.namaAkun.toLowerCase().includes("bank"))
  );
  const totalKasAwalBersih = akunKas.reduce((sum, a) => sum + getNetBalance(a, "DEBIT"), 0);

  const pendapatan = akunList.filter(a => a.kategori === "PENDAPATAN");
  const beban = akunList.filter(a => a.kategori === "BEBAN");
  const piutang = akunList.filter(a => a.kategori === "ASET_LANCAR" && a.namaAkun.toLowerCase().includes("piutang"));
  const hutang = akunList.filter(a =>
    (a.kategori === "KEWAJIBAN_JANGKA_PENDEK" || a.kategori === "KEWAJIBAN_JANGKA_PANJANG") &&
    (a.namaAkun.toLowerCase().includes("hutang") || a.namaAkun.toLowerCase().includes("utang"))
  );
  const simpanan = akunList.filter(a => a.kategori === "MODAL" && a.namaAkun.toLowerCase().includes("simpanan"));
  const pinjaman = akunList.filter(a =>
    (a.kategori === "KEWAJIBAN_JANGKA_PENDEK" || a.kategori === "KEWAJIBAN_JANGKA_PANJANG") &&
    a.namaAkun.toLowerCase().includes("pinjaman")
  );
  const asetTetap = akunList.filter(a => a.kategori === "ASET_TETAP");

  const operasiMasuk = pendapatan.map(a => ({
    ...a,
    saldo: getNetBalance(a, "KREDIT"),
  })).filter(a => a.saldo !== 0);

  const operasiKeluar = beban.map(a => ({
    ...a,
    saldo: getNetBalance(a, "DEBIT"),
  })).filter(a => a.saldo !== 0);

  const investasiMasuk: any[] = [];
  const investasiKeluar = asetTetap.map(a => ({
    ...a,
    saldo: getNetBalance(a, "DEBIT"),
  })).filter(a => a.saldo !== 0);

  const pendanaanMasuk = [
    ...simpanan.map(a => ({ ...a, saldo: getNetBalance(a, "KREDIT") })).filter(a => a.saldo !== 0),
    ...pinjaman.map(a => ({ ...a, saldo: getNetBalance(a, "KREDIT") })).filter(a => a.saldo !== 0),
  ];
  const pendanaanKeluar: any[] = [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Laporan Arus Kas</h1>
        <p className="text-muted-foreground">
          Laporan aliran masuk dan keluar kas (cash flow statement).
        </p>
      </div>
      <ArusKasClient
        operasiMasuk={operasiMasuk}
        operasiKeluar={operasiKeluar}
        investasiMasuk={investasiMasuk}
        investasiKeluar={investasiKeluar}
        pendanaanMasuk={pendanaanMasuk}
        pendanaanKeluar={pendanaanKeluar}
        kasAwal={totalKasAwalBersih}
        initialParams={{ startDate, endDate }}
      />
    </div>
  );
}
