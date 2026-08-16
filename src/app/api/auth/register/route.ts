import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { DEFAULT_AKUN_LIST, getSaldoNormal } from '@/lib/accounting';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { namaUsaha, alamat, telepon, namaAdmin, email, username, password } = body;

    // Validate required fields
    if (!namaUsaha || !namaAdmin || !email || !username || !password) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create Organisasi
    const organisasi = await prisma.organisasi.create({
      data: {
        nama: namaUsaha,
        alamat: alamat || null,
        telepon: telepon || null,
      }
    });

    // 2. Create User (tanpa field 'role' karena tidak ada di schema)
    const user = await prisma.user.create({
      data: {
        nama: namaAdmin,
        email,
        username,
        password: hashedPassword,
        organisasiId: organisasi.id,
      }
    });

    // 3. Create default Chart of Accounts satu per satu
    for (const akun of DEFAULT_AKUN_LIST) {
      await prisma.akun.create({
        data: {
          kodeAkun: akun.kodeAkun,
          namaAkun: akun.namaAkun,
          kategori: akun.kategori,
          saldoNormal: getSaldoNormal(akun.kategori),
          organisasiId: organisasi.id,
        }
      });
    }

    return NextResponse.json({ success: true, message: 'Registrasi berhasil' }, { status: 201 });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
