'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Mail, Lock, Building2, Phone, MapPin, Loader2, UserPlus, Sparkles } from "lucide-react";
import Swal from "sweetalert2";
import { ThemeToggle } from '@/components/theme-toggle';
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    namaUsaha: '', alamat: '', telepon: '',
    namaAdmin: '', email: '', username: '',
    password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan Konfirmasi Password tidak cocok');
      Swal.fire({ title: "Gagal", text: "Password dan Konfirmasi Password tidak cocok", icon: "warning" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await Swal.fire({ title: "Registrasi Berhasil", text: "Akun usaha Anda berhasil dibuat! Silakan login.", icon: "success", timer: 2000, showConfirmButton: false });
        router.push('/login?registered=true');
      } else {
        const data = await res.json();
        setError(data.error || 'Terjadi kesalahan saat registrasi');
        Swal.fire({ title: "Registrasi Gagal", text: data.error || 'Terjadi kesalahan saat registrasi', icon: "error" });
      }
    } catch {
      setError('Terjadi kesalahan jaringan');
      Swal.fire({ title: "Error", text: "Terjadi kesalahan jaringan", icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 animated-gradient" />
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-indigo-500/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-[120px]" />

      {/* Theme toggle & Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </Button>
      </div>
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="w-full border-none shadow-2xl bg-background/60 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/25">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Registrasi Usaha
          </CardTitle>
          <CardDescription>
            Daftarkan usaha Anda untuk mulai menggunakan sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="namaUsaha">Nama Usaha</Label>
              <Input id="namaUsaha" name="namaUsaha" required value={formData.namaUsaha} onChange={handleChange} placeholder="Usaha Sejahtera Mandiri" className="h-11" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Input id="alamat" name="alamat" value={formData.alamat} onChange={handleChange} placeholder="Jl. Merdeka No. 1" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telepon">No. Telepon</Label>
                <Input id="telepon" name="telepon" value={formData.telepon} onChange={handleChange} placeholder="0812xxxx" className="h-11" />
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Data Admin</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="namaAdmin">Nama Admin</Label>
              <Input id="namaAdmin" name="namaAdmin" required value={formData.namaAdmin} onChange={handleChange} placeholder="Nama lengkap admin" className="h-11" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="admin@email.com" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required value={formData.username} onChange={handleChange} placeholder="admin123" className="h-11" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" className="h-11" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 text-base"
              disabled={loading}
            >
              {loading ? 'Mendaftar...' : 'Daftar Usaha'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-indigo-500 hover:text-indigo-400 font-medium hover:underline">
              Login di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
      </motion.div>
    </div>
  );
}
