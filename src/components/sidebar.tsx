"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  Store,
  Landmark,
  Wallet,
  ClipboardList,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  FileSpreadsheet,
  PieChart,
  LogOut,
  Sparkles,
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuGroups = [
  {
    title: "Menu Utama",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Data Organisasi",
    items: [
      { title: "Pengurus", href: "/dashboard/pengurus", icon: Users },
      { title: "Anggota", href: "/dashboard/anggota", icon: Users },
      { title: "Toko Pembelian", href: "/dashboard/toko-pembelian", icon: Building2 },
      { title: "Toko Penjualan", href: "/dashboard/toko-penjualan", icon: Store },
    ],
  },
  {
    title: "Koperasi",
    items: [
      { title: "Simpanan", href: "/dashboard/simpanan", icon: Landmark },
      { title: "Pinjaman", href: "/dashboard/pinjaman", icon: Wallet },
    ],
  },
  {
    title: "Akuntansi",
    items: [
      { title: "Chart of Accounts", href: "/dashboard/akun", icon: ClipboardList },
    ],
  },
  {
    title: "Jurnal Transaksi",
    items: [
      { title: "Pembelian Kredit", href: "/dashboard/jurnal/pembelian-kredit", icon: TrendingDown },
      { title: "Penjualan Kredit", href: "/dashboard/jurnal/penjualan", icon: TrendingUp },
      { title: "Penerimaan Kas", href: "/dashboard/jurnal/penerimaan-kas", icon: ArrowRightLeft },
      { title: "Pengeluaran Kas", href: "/dashboard/jurnal/pengeluaran-kas", icon: ArrowRightLeft },
      { title: "Jurnal Umum", href: "/dashboard/jurnal/umum", icon: BookOpen },
    ],
  },
  {
    title: "Laporan Keuangan",
    items: [
      { title: "Laporan Simpanan", href: "/dashboard/laporan/simpanan", icon: Landmark },
      { title: "Buku Besar", href: "/dashboard/laporan/buku-besar", icon: BookOpen },
      { title: "Neraca Saldo", href: "/dashboard/laporan/neraca-saldo", icon: FileSpreadsheet },
      { title: "Laba Rugi", href: "/dashboard/laporan/laba-rugi", icon: PieChart },
      { title: "Neraca", href: "/dashboard/laporan/neraca", icon: FileSpreadsheet },
    ],
  },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight gradient-text">SIA Koperasi</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-6">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1.5">
              <h4 className="px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group.title}
              </h4>
              <div className="space-y-0.5">
                {group.items.map((item, itemIndex) => {
                  const isActive = pathname === item.href || 
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-foreground shadow-sm border border-indigo-500/20"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                      )}
                      <Icon className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-indigo-500" : "group-hover:text-foreground"
                      )} />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <div className="border-t p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </div>
  );
}
