import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  try {
    const drafts = await prisma.post.findMany({
      where: { status: { in: ["DRAFT", "PUBLISHING", "FAILED"] } },
      orderBy: { updatedAt: "desc" },
      select: { id: true, text: true, topic: true, source: true, status: true, createdAt: true, updatedAt: true, profileVersionId: true, errorMessage: true },
    });
    return NextResponse.json({ drafts });
  } catch {
    console.error("Could not load drafts.");
    return NextResponse.json({ error: "Draft belum bisa dimuat. Periksa koneksi database." }, { status: 503 });
  }
}
