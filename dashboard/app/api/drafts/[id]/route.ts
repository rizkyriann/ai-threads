import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({ text: z.string().trim().min(1).max(500) });

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Isi draft tidak valid." }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Draft wajib berisi teks maksimal 500 karakter." },
      { status: 400 },
    );

  const { id } = await context.params;
  try {
    const draft = await prisma.post.update({
      where: { id, status: "DRAFT" },
      data: { text: parsed.data.text },
      select: {
        id: true,
        text: true,
        topic: true,
        source: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        profileVersionId: true,
      },
    });
    return NextResponse.json({ draft });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Draft tidak ditemukan atau sudah tidak bisa diedit." },
        { status: 404 },
      );
    }
    console.error("Could not update draft.");
    return NextResponse.json({ error: "Draft tidak bisa disimpan saat ini." }, { status: 503 });
  }
}
