import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { generateDrafts, isGeminiTimeout } from "@/lib/draft-generator";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({ idea: z.string().trim().min(2).max(1200), count: z.number().int().min(1).max(5).default(5) });
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan generate tidak valid." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Masukkan ide (2–1.200 karakter) dan jumlah draft yang valid." }, { status: 400 });

  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "GEMINI_API_KEY belum diatur di environment server." }, { status: 503 });

  try {
    const output = await generateDrafts({ idea: parsed.data.idea, count: parsed.data.count });

    const created = await prisma.$transaction(output.drafts.map((draft) => prisma.post.create({
      data: { text: draft.text, topic: draft.topic, source: "AI", status: "DRAFT", generationPrompt: parsed.data.idea, profileVersionId: output.profileVersionId },
      select: { id: true, text: true, topic: true, source: true, status: true, createdAt: true, updatedAt: true, profileVersionId: true },
    })));

    return NextResponse.json({ drafts: created }, { status: 201 });
  } catch (error) {
    console.error("Draft generation failed.");
    if (isGeminiTimeout(error)) {
      return NextResponse.json({ error: "Gemini belum merespons tepat waktu. Ide tetap tersimpan di form; coba lagi sebentar." }, { status: 504 });
    }
    return NextResponse.json({ error: "Draft tidak berhasil dibuat. Coba lagi sebentar lagi." }, { status: 502 });
  }
}
