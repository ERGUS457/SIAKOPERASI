import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organisasi: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      nama: user.nama,
      username: user.username,
      email: user.email,
      fotoProfil: user.fotoProfil || null,
      organisasiNama: user.organisasi?.nama || "",
      organisasiAlamat: user.organisasi?.alamat || "",
      organisasiTelepon: user.organisasi?.telepon || "",
      organisasiEmail: user.organisasi?.email || "",
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      nama,
      username,
      email,
      newPassword,
      organisasiNama,
      organisasiAlamat,
      organisasiTelepon,
      fotoProfil,
    } = body;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { organisasiId: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build update object for User
    const userUpdateData: any = {};
    if (nama) userUpdateData.nama = nama;
    if (username) userUpdateData.username = username;
    if (email) userUpdateData.email = email;
    if (fotoProfil !== undefined) userUpdateData.fotoProfil = fotoProfil;
    if (newPassword && newPassword.trim().length >= 6) {
      userUpdateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    });

    // Update Organisasi
    if (currentUser.organisasiId) {
      const orgUpdateData: any = {};
      if (organisasiNama) orgUpdateData.nama = organisasiNama;
      if (organisasiAlamat !== undefined) orgUpdateData.alamat = organisasiAlamat;
      if (organisasiTelepon !== undefined) orgUpdateData.telepon = organisasiTelepon;

      await prisma.organisasi.update({
        where: { id: currentUser.organisasiId },
        data: orgUpdateData,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profil dan data koperasi berhasil diperbarui",
      user: {
        nama: updatedUser.nama,
        email: updatedUser.email,
        fotoProfil: updatedUser.fotoProfil,
      },
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
