'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Lock, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      if (result?.error) {
        setError('Email atau password salah');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 animated-gradient" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-500/15 rounded-full blur-[120px]" />

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

      <Card className="relative z-10 w-full max-w-md border bg-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/25">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">
            Selamat Datang Kembali
          </CardTitle>
          <CardDescription>
            Masuk ke akun koperasi Anda
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email" name="email" type="email" required
                value={formData.email} onChange={handleChange}
                placeholder="admin@koperasi.com"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password" name="password" type="password" required
                value={formData.password} onChange={handleChange}
                placeholder="••••••••"
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 text-base"
              disabled={loading}
            >
              {loading ? 'Memeriksa...' : 'Masuk ke Dashboard'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/register" className="text-indigo-500 hover:text-indigo-400 font-medium hover:underline">
              Daftar Koperasi
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
