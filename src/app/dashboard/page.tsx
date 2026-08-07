import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, DollarSign, CreditCard, Activity, Users } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  
  // @ts-ignore
  const organisasiId = session?.organisasiId;

  if (!organisasiId) {
    return <div>Silakan login ulang.</div>;
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
  let totalKas = 0;
  let totalPiutang = 0;
  let totalKewajiban = 0;

  akunList.forEach((akun) => {
    // Hitung saldo
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
    if (akun.kategori === "ASET_LANCAR" || akun.kategori === "ASET_TETAP") {
      totalAset += saldo;
    }
    
    if (akun.kategori === "KEWAJIBAN_JANGKA_PENDEK" || akun.kategori === "KEWAJIBAN_JANGKA_PANJANG") {
      totalKewajiban += saldo;
    }

    if (akun.namaAkun.toLowerCase().includes("kas") || akun.namaAkun.toLowerCase().includes("bank")) {
      totalKas += saldo;
    }

    if (akun.namaAkun.toLowerCase().includes("piutang")) {
      totalPiutang += saldo;
    }
  });

  const totalAnggota = await prisma.anggota.count({
    where: { organisasiId }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Keuangan</h2>
        <p className="text-muted-foreground mt-1">
          Ringkasan kondisi keuangan koperasi Anda secara real-time.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Aset */}
        <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Aset</CardTitle>
            <div className="rounded-full bg-primary/20 p-2 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalAset)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              +2.1% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        {/* Total Kas & Bank */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kas & Bank (Likuiditas)</CardTitle>
            <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-500">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalKas)}</div>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-500">
              Dana tersedia untuk operasional
            </p>
          </CardContent>
        </Card>

        {/* Total Piutang */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
            <div className="rounded-full bg-amber-500/20 p-2 text-amber-500">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalPiutang)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Piutang anggota & usaha
            </p>
          </CardContent>
        </Card>

        {/* Kewajiban */}
        <Card className="shadow-sm">
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
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Anggota Aktif</CardTitle>
            <div className="rounded-full bg-blue-500/20 p-2 text-blue-500">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnggota} Anggota</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tergabung dalam koperasi
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Aktivitas Jurnal Terbaru</CardTitle>
            <CardDescription>
              Transkasi keuangan yang baru saja dicatat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Menunggu data transaksi... Modul jurnal belum diimplementasi.
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Rasio Keuangan</CardTitle>
            <CardDescription>
              Indikator kesehatan koperasi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Current Ratio (Aset Lancar / Hutang Lancar)</span>
                  <span className="font-bold">--</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary w-[0%]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
