import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, FolderTree, BookText, FileBarChart, Building2, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: "Double-Entry Bookkeeping",
    description: "Sistem pencatatan ganda yang memastikan keseimbangan dan akurasi laporan keuangan Anda.",
    color: "from-blue-500 to-cyan-400",
    iconColor: "text-blue-500",
  },
  {
    icon: Users,
    title: "Manajemen Simpan Pinjam",
    description: "Kelola simpanan, pinjaman, dan angsuran anggota koperasi dengan mudah dan otomatis.",
    color: "from-purple-500 to-pink-400",
    iconColor: "text-purple-500",
  },
  {
    icon: FolderTree,
    title: "Chart of Accounts",
    description: "Bagan akun fleksibel standar SAK ETAP yang dapat disesuaikan dengan kebutuhan.",
    color: "from-emerald-500 to-teal-400",
    iconColor: "text-emerald-500",
  },
  {
    icon: BookText,
    title: "5 Jenis Jurnal",
    description: "Jurnal Pembelian, Penjualan, Penerimaan Kas, Pengeluaran Kas, dan Jurnal Umum.",
    color: "from-amber-500 to-orange-400",
    iconColor: "text-amber-500",
  },
  {
    icon: FileBarChart,
    title: "Laporan Real-Time",
    description: "Buku Besar, Neraca Saldo, Laba Rugi, dan Neraca yang dihitung secara real-time.",
    color: "from-pink-500 to-rose-400",
    iconColor: "text-pink-500",
  },
  {
    icon: Building2,
    title: "Multi-Organisasi",
    description: "Setiap koperasi memiliki ruang kerja terpisah dan privasi data yang terjamin.",
    color: "from-indigo-500 to-violet-400",
    iconColor: "text-indigo-500",
  },
];

const stats = [
  { label: "Fitur Akuntansi", value: "40+" },
  { label: "Jenis Jurnal", value: "5" },
  { label: "Laporan Keuangan", value: "4" },
  { label: "Keamanan Data", value: "100%" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">SIA Koperasi</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25">
                Daftar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative w-full overflow-hidden py-24 md:py-32 lg:py-40">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 animated-gradient" />
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px]" />

          <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              Platform Akuntansi Koperasi Terbaik
            </div>

            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Kelola Keuangan{" "}
              <span className="gradient-text">Koperasi</span> Anda{" "}
              <span className="gradient-text">dengan Mudah</span>
            </h1>

            <p className="mx-auto max-w-[650px] text-lg text-muted-foreground md:text-xl leading-relaxed">
              Solusi lengkap berbasis web untuk pencatatan akuntansi, manajemen simpan pinjam, dan pelaporan keuangan secara real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/25 px-8 h-12 text-base">
                  Mulai Sekarang — Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  Login ke Dashboard
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-24 border-t">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground mb-4">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Fitur Unggulan
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Semua yang Anda Butuhkan dalam <span className="gradient-text">Satu Platform</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Dirancang khusus untuk kebutuhan koperasi Indonesia dengan standar akuntansi SAK ETAP.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={i}
                    className="group relative overflow-hidden border bg-card hover-lift cursor-default"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    <CardHeader>
                      <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-24 border-t">
          <div className="container mx-auto px-4 md:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px]">
              <div className="rounded-3xl bg-background/95 backdrop-blur-xl px-8 py-16 text-center sm:px-16">
                <Shield className="mx-auto mb-6 h-12 w-12 text-indigo-500" />
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Siap Mendigitalisasi Keuangan Koperasi Anda?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
                  Daftar sekarang dan nikmati kemudahan pencatatan akuntansi dengan sistem yang aman dan terpercaya.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <Link href="/register">
                    <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/25 px-8 h-12 text-base">
                      Daftar Gratis Sekarang
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SIA Koperasi — Sistem Informasi Akuntansi. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
