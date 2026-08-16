import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  CreditCard,
  Activity,
  Users,
  FileText,
  TrendingUp,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth();

  // @ts-ignore
  const organisasiId = session?.organisasiId;

  if (!organisasiId) {
    return <div className="p-6">Silakan login ulang.</div>;
  }

  // Ambil saldo dari Akun
  const akunList = await prisma.akun.findMany({
    where: { organisasiId },
    include: {
      detailJurnal: {
        include: {
          transaksi: true,
        },
      },
    },
  });

  let totalAset = 0;
  let totalAsetLancar = 0;
  let totalKas = 0;
  let totalPiutang = 0;
  let totalKewajiban = 0;
  let totalHutangLancar = 0;

  akunList.forEach((akun) => {
    let totalDebit = 0;
    let totalKredit = 0;

    akun.detailJurnal.forEach((dj) => {
      if (dj.posisi === "DEBIT") totalDebit += dj.nominal;
      else totalKredit += dj.nominal;
    });

    let saldo = 0;
    if (akun.saldoNormal === "DEBIT") {
      saldo = totalDebit - totalKredit;
    } else {
      saldo = totalKredit - totalDebit;
    }

    // Klasifikasikan
    if (akun.kategori === "ASET_LANCAR") {
      totalAsetLancar += saldo;
      totalAset += saldo;
    } else if (akun.kategori === "ASET_TETAP") {
      totalAset += saldo;
    }

    if (akun.kategori === "KEWAJIBAN_JANGKA_PENDEK") {
      totalHutangLancar += saldo;
      totalKewajiban += saldo;
    } else if (akun.kategori === "KEWAJIBAN_JANGKA_PANJANG") {
      totalKewajiban += saldo;
    }

    if (
      akun.namaAkun.toLowerCase().includes("kas") ||
      akun.namaAkun.toLowerCase().includes("bank")
    ) {
      totalKas += saldo;
    }

    if (akun.namaAkun.toLowerCase().includes("piutang")) {
      totalPiutang += saldo;
    }
  });

  const totalAnggota = await prisma.anggota.count({
    where: { organisasiId },
  });

  // Ambil 5 Transaksi Jurnal Terbaru
  const recentTransactions = await prisma.transaksi.findMany({
    where: { organisasiId },
    orderBy: { tanggal: "desc" },
    take: 5,
    include: {
      detailJurnal: true,
      anggota: true,
      tokoPembelian: true,
      tokoPenjualan: true,
    },
  });

  // Hitung Rasio Keuangan
  const currentRatio =
    totalHutangLancar > 0 ? (totalAsetLancar / totalHutangLancar) * 100 : totalAsetLancar > 0 ? 100 : 0;

  const cashRatio =
    totalHutangLancar > 0 ? (totalKas / totalHutangLancar) * 100 : totalKas > 0 ? 100 : 0;

  const debtToAssetRatio =
    totalAset > 0 ? (totalKewajiban / totalAset) * 100 : 0;

  const getJenisJurnalBadge = (jenis: string) => {
    switch (jenis) {
      case "PEMBELIAN_KREDIT":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">Pembelian Kredit</Badge>;
      case "PENJUALAN":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Penjualan</Badge>;
      case "PENERIMAAN_KAS":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">Penerimaan Kas</Badge>;
      case "PENGELUARAN_KAS":
        return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-200">Pengeluaran Kas</Badge>;
      default:
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200">Jurnal Umum</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Keuangan</h2>
        <p className="text-muted-foreground mt-1">
          Ringkasan kondisi keuangan usaha Anda secara real-time.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Aset */}
        <Card className="bg-gradient-to-br from-indigo-500/10 via-background to-background border-indigo-500/20 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Aset</CardTitle>
            <div className="rounded-full bg-indigo-500/20 p-2 text-indigo-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalAset)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-600 font-medium">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              Total nilai aset usaha
            </p>
          </CardContent>
        </Card>

        {/* Total Kas & Bank */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kas & Bank (Likuiditas)</CardTitle>
            <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-600">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalKas)}</div>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-600 font-medium">
              Dana siap pakai operasional
            </p>
          </CardContent>
        </Card>

        {/* Total Piutang */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
            <div className="rounded-full bg-amber-500/20 p-2 text-amber-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalPiutang)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Piutang anggota & pihak luar
            </p>
          </CardContent>
        </Card>

        {/* Kewajiban */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Kewajiban</CardTitle>
            <div className="rounded-full bg-destructive/20 p-2 text-destructive">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalKewajiban)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Hutang jangka pendek & panjang
            </p>
          </CardContent>
        </Card>

        {/* Total Anggota */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Anggota Aktif</CardTitle>
            <div className="rounded-full bg-blue-500/20 p-2 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnggota} Anggota</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tergabung dalam usaha
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AKTIVITAS JURNAL TERBARU & RASIO KEUANGAN */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7 mt-6">
        {/* AKTIVITAS JURNAL TERBARU */}
        <Card className="col-span-1 lg:col-span-4 shadow-xs w-full overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-4 sm:h-5 w-4 sm:w-5 text-indigo-600 shrink-0" />
                Aktivitas Jurnal Terbaru
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Transaksi keuangan yang baru saja dicatat dalam sistem.
              </CardDescription>
            </div>
            <Link href="/dashboard/jurnal/umum" className="self-start sm:self-auto">
              <Button size="sm" variant="outline" className="text-xs gap-1 h-8">
                <PlusCircle className="h-3.5 w-3.5" />
                Tambah Jurnal
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground space-y-3">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
                <p className="text-sm">Belum ada transaksi jurnal yang dicatat.</p>
                <Link href="/dashboard/jurnal/penerimaan-kas">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Buat Transaksi Pertama
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentTransactions.map((tx) => {
                  const nominalTotal = tx.detailJurnal
                    .filter((d) => d.posisi === "DEBIT")
                    .reduce((sum, d) => sum + d.nominal, 0);

                  const kontakNama =
                    tx.anggota?.nama ||
                    tx.tokoPembelian?.namaToko ||
                    tx.tokoPenjualan?.namaToko ||
                    "-";

                  return (
                    <div
                      key={tx.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 sm:p-3 rounded-lg border bg-card hover:bg-accent/40 transition-colors overflow-hidden"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-foreground">
                            {tx.nomorTransaksi}
                          </span>
                          {getJenisJurnalBadge(tx.jenisJurnal)}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {tx.keterangan || "Tidak ada keterangan"} &bull;{" "}
                          <span className="font-medium text-foreground">
                            {kontakNama}
                          </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground/70">
                          {new Date(tx.tanggal).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-left sm:text-right shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-border/50 flex justify-between sm:block items-center">
                        <span className="text-[11px] text-muted-foreground sm:hidden">Total:</span>
                        <span className="font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                          {formatRupiah(nominalTotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* RASIO KEUANGAN */}
        <Card className="col-span-1 lg:col-span-3 shadow-xs w-full overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Rasio Keuangan
            </CardTitle>
            <CardDescription>
              Indikator kesehatan & kemampuan finansial usaha.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Ratio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold">Rasio Lancar (Current Ratio)</span>
                  <p className="text-[11px] text-muted-foreground">
                    Aset Lancar vs Hutang Lancar
                  </p>
                </div>
                <span className="font-bold text-indigo-600 text-base">
                  {currentRatio > 0 ? `${currentRatio.toFixed(1)}%` : "100%"}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                  style={{ width: `${Math.min(currentRatio, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Kemampuan bayar hutang lancar</span>
                <span className="font-medium text-emerald-600">
                  {currentRatio >= 100 ? "Sehat" : "Perlu Perhatian"}
                </span>
              </div>
            </div>

            {/* Cash Ratio */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold">Rasio Kas (Cash Ratio)</span>
                  <p className="text-[11px] text-muted-foreground">
                    Kas & Bank vs Hutang Jangka Pendek
                  </p>
                </div>
                <span className="font-bold text-emerald-600 text-base">
                  {cashRatio > 0 ? `${cashRatio.toFixed(1)}%` : "100%"}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${Math.min(cashRatio, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Ketersediaan dana cepat</span>
                <span className="font-medium text-emerald-600">Likuid</span>
              </div>
            </div>

            {/* Debt to Asset Ratio */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold">Rasio Hutang (Solvabilitas)</span>
                  <p className="text-[11px] text-muted-foreground">
                    Total Hutang vs Total Aset
                  </p>
                </div>
                <span className="font-bold text-amber-600 text-base">
                  {debtToAssetRatio > 0 ? `${debtToAssetRatio.toFixed(1)}%` : "0%"}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                  style={{ width: `${Math.min(debtToAssetRatio, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Persentase aset terikat hutang</span>
                <span className="font-medium text-emerald-600">Aman</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
