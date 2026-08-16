"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, FolderTree, BookText, FileBarChart, Building2, ArrowRight, Sparkles, Shield, Zap, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';

const features = [
  {
    icon: BookOpen,
    title: "Double-Entry Bookkeeping",
    description: "Sistem pencatatan ganda yang memastikan keseimbangan dan akurasi laporan keuangan Anda.",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: Users,
    title: "Manajemen Simpan Pinjam",
    description: "Kelola simpanan, pinjaman, dan angsuran anggota usaha dengan mudah dan otomatis.",
    color: "from-purple-500 to-pink-400",
  },
  {
    icon: FolderTree,
    title: "Chart of Accounts",
    description: "Bagan akun fleksibel standar SAK ETAP yang dapat disesuaikan dengan kebutuhan.",
    color: "from-emerald-500 to-teal-400",
  },
  {
    icon: BookText,
    title: "5 Jenis Jurnal",
    description: "Jurnal Pembelian, Penjualan, Penerimaan Kas, Pengeluaran Kas, dan Jurnal Umum.",
    color: "from-amber-500 to-orange-400",
  },
  {
    icon: FileBarChart,
    title: "Laporan Real-Time",
    description: "Buku Besar, Neraca Saldo, Laba Rugi, dan Neraca yang dihitung secara real-time.",
    color: "from-pink-500 to-rose-400",
  },
  {
    icon: Building2,
    title: "Multi-Organisasi",
    description: "Setiap usaha memiliki ruang kerja terpisah dan privasi data yang terjamin.",
    color: "from-indigo-500 to-violet-400",
  },
];

const stats = [
  { label: "Fitur Akuntansi", value: "40+" },
  { label: "Jenis Jurnal", value: "5" },
  { label: "Laporan Keuangan", value: "4" },
  { label: "Keamanan Data", value: "100%" },
];

const faqs = [
  {
    question: "Apakah aplikasi ini gratis?",
    answer: "Ya, Anda bisa mendaftar dan mencoba fitur dasar kami secara gratis selamanya. Kami juga memiliki paket premium untuk kebutuhan usaha yang lebih kompleks."
  },
  {
    question: "Apakah data usaha saya aman?",
    answer: "Tentu. Kami menggunakan sistem enkripsi tingkat bank dan database terisolasi untuk setiap usaha. Data Anda 100% aman dan tidak akan kami bagikan ke pihak ketiga."
  },
  {
    question: "Apakah sistem ini sesuai standar akuntansi Indonesia?",
    answer: "Sistem kami dibangun berdasarkan pedoman Standar Akuntansi Keuangan Entitas Tanpa Akuntabilitas Publik (SAK ETAP) yang sangat cocok untuk Usaha."
  },
  {
    question: "Apakah bisa digunakan di HP?",
    answer: "SIMPEL-KU adalah aplikasi berbasis web (PWA) yang sudah didesain responsif. Anda dapat membukanya melalui browser di HP, tablet, maupun laptop dengan tampilan yang menyesuaikan layar."
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">SIMPEL-KU</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#fitur" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Fitur</Link>
            <Link href="#keunggulan" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Keunggulan</Link>
            <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="px-2.5 sm:px-3 text-xs sm:text-sm font-medium">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="px-2.5 sm:px-3 text-xs sm:text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md sm:shadow-lg shadow-indigo-500/25">
                Daftar <span className="hidden sm:inline">Gratis</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative w-full overflow-hidden py-24 md:py-32 lg:py-40">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 animated-gradient" />
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px]" />

          <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center text-center space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              Platform Akuntansi Usaha Terbaik
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Kelola Keuangan{" "}
              <span className="gradient-text">Usaha</span> Anda{" "}
              <span className="gradient-text">dengan Mudah</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto max-w-[650px] text-lg text-muted-foreground md:text-xl leading-relaxed"
            >
              Solusi lengkap berbasis web untuk pencatatan akuntansi, manajemen simpan pinjam, dan pelaporan keuangan secara real-time.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/25 px-8 h-12 text-base">
                  Mulai Sekarang - Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  Masuk ke Dashboard
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 w-full max-w-4xl"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="fitur" className="w-full py-24 border-t relative overflow-hidden bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-16 max-w-2xl text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground mb-4">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Fitur Unggulan
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Semua yang Anda Butuhkan dalam <span className="gradient-text">Satu Platform</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Dirancang khusus untuk kebutuhan usaha Indonesia dengan standar akuntansi SAK ETAP.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card className="group relative overflow-hidden border bg-background hover-lift cursor-default h-full">
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
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Keunggulan (How it works / Why us) */}
        <section id="keunggulan" className="w-full py-24 border-t">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground mb-4">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  Mengapa Memilih Kami?
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                  Tinggalkan Pencatatan Manual yang Memusingkan
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 font-bold">1</div>
                    <div>
                      <h3 className="font-semibold text-lg">Otomatisasi Laporan</h3>
                      <p className="text-muted-foreground">Tidak perlu lagi pusing membuat neraca. Begitu transaksi dicatat, laporan keuangan Anda langsung diperbarui detik itu juga.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 font-bold">2</div>
                    <div>
                      <h3 className="font-semibold text-lg">Anti Selisih & Kesalahan</h3>
                      <p className="text-muted-foreground">Sistem double-entry kami mencegah ketidakseimbangan (unbalance) dan meminimalkan *human error*.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-pink-500/10 text-pink-500 font-bold">3</div>
                    <div>
                      <h3 className="font-semibold text-lg">Bisa Diakses Darimana Saja</h3>
                      <p className="text-muted-foreground">Basis Cloud yang aman memungkinkan pengurus usaha memantau data dari smartphone, kapan saja.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative h-[400px] w-full rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 overflow-hidden flex items-center justify-center p-8 shadow-2xl"
              >
                <div className="absolute inset-0 bg-[url('https://siausaha.vercel.app/noise.png')] opacity-20 mix-blend-overlay"></div>
                {/* Mockup Dashboard Simple */}
                <div className="w-full h-full bg-background/90 backdrop-blur-md rounded-xl border shadow-xl flex flex-col p-4 relative z-10 overflow-hidden">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div className="ml-4 h-4 w-32 bg-muted rounded-full" />
                  </div>
                  <div className="flex-1 flex gap-4 pt-4">
                    <div className="w-1/4 space-y-3 hidden sm:block">
                      <div className="h-8 w-full bg-muted rounded-md" />
                      <div className="h-8 w-full bg-muted rounded-md" />
                      <div className="h-8 w-full bg-muted rounded-md" />
                      <div className="h-8 w-full bg-muted rounded-md" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex gap-4">
                        <div className="h-24 flex-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30" />
                        <div className="h-24 flex-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30" />
                      </div>
                      <div className="h-40 w-full bg-muted rounded-xl" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-24 border-t bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Pertanyaan yang Sering Diajukan
              </h2>
            </motion.div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-border">
                    <CardHeader className="cursor-pointer" onClick={(e) => {
                      const content = e.currentTarget.nextElementSibling;
                      content?.classList.toggle('hidden');
                    }}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">{faq.question}</CardTitle>
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent className="hidden pt-0 text-muted-foreground">
                      {faq.answer}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-24 border-t">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px]"
            >
              <div className="rounded-3xl bg-background/95 backdrop-blur-xl px-8 py-16 text-center sm:px-16">
                <Shield className="mx-auto mb-6 h-12 w-12 text-indigo-500" />
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Siap Mendigitalisasi Keuangan Usaha Anda?
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
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-8 bg-muted/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SIMPEL-KU - Sistem Penyusunan Laporan Keuangan Terpadu. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
