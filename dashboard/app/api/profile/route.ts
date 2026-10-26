import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  niche: z.string().trim().min(1).max(191),
  topics: z.string().trim().max(4000),
  audience: z.string().trim().min(1).max(2000),
  tone: z.string().trim().min(1).max(2000),
  language: z.string().trim().min(1).max(100),
  rules: z.string().trim().max(4000),
  examples: z.array(z.object({ text: z.string().trim().min(1).max(500), isTop: z.boolean() })).min(5).max(20),
});

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  try {
    const [profile, versions] = await Promise.all([
      prisma.profileVersion.findFirst({ orderBy: { version: "desc" }, include: { examples: { orderBy: { id: "asc" } } } }),
      prisma.profileVersion.findMany({ orderBy: { version: "desc" }, select: { version: true, createdAt: true }, take: 20 }),
    ]);
    return NextResponse.json({ profile, versions });
  } catch {
    console.error("Could not load content profile.");
    return NextResponse.json({ error: "Content profile belum bisa dimuat. Periksa koneksi database." }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data profile tidak valid." }, { status: 400 });
  }
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Isi seluruh kolom wajib dan masukkan 5–20 contoh tulisan (maksimal 500 karakter tiap contoh)." }, { status: 400 });

  try {
    const latest = await prisma.profileVersion.findFirst({ orderBy: { version: "desc" }, select: { version: true } });
    const profile = await prisma.profileVersion.create({
      data: {
        version: (latest?.version ?? 0) + 1,
        niche: parsed.data.niche,
        topics: parsed.data.topics,
        audience: parsed.data.audience,
        tone: parsed.data.tone,
        language: parsed.data.language,
        rules: parsed.data.rules,
        examples: { create: parsed.data.examples.map((example) => ({ text: example.text, isTop: example.isTop })) },
      },
      include: { examples: { orderBy: { id: "asc" } } },
    });
    return NextResponse.json({ profile }, { status: 201 });
  } catch {
    console.error("Could not save content profile.");
    return NextResponse.json({ error: "Content profile belum bisa disimpan." }, { status: 503 });
  }
}
