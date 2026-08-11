import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !(session as any).userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fotoProfil } = await req.json();

    if (!fotoProfil) {
      return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 400 });
    }

    const userId = (session as any).userId;

    // Update user profile in database
    await prisma.user.update({
      where: { id: userId },
      data: { fotoProfil },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error uploading profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
