import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { generateDrafts, isGeminiTimeout } from "@/lib/draft-generator";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  if (!process.env.GEMINI_API_KEY)
    return NextResponse.json(
      { error: "GEMINI_API_KEY belum diatur di environment server." },
      { status: 503 },
    );

  const { id } = await context.params;
  try {
    const post = await prisma.post.findFirst({ where: { id, status: "DRAFT", source: "AI" } });
    if (!post)
      return NextResponse.json(
        { error: "Draft AI tidak ditemukan atau tidak bisa diregenerasi." },
        { status: 404 },
      );

    const idea =
      post.generationPrompt?.trim() ||
      `${post.topic}\n\nVersi sebelumnya sebagai konteks:\n${post.text}`;
    const generated = await generateDrafts({
      idea,
      count: 1,
      profileVersionId: post.profileVersionId,
    });
    const replacement = generated.drafts[0];
    if (!replacement)
      return NextResponse.json(
        { error: "AI tidak menghasilkan draft pengganti." },
        { status: 502 },
      );

    const updated = await prisma.post.update({
      where: { id, status: "DRAFT" },
      data: {
        text: replacement.text,
        topic: replacement.topic,
        generationPrompt: idea,
        profileVersionId: generated.profileVersionId,
      },
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
    return NextResponse.json({ draft: updated });
  } catch (error) {
    console.error("Draft regeneration failed.");
    if (isGeminiTimeout(error)) {
      return NextResponse.json(
        { error: "Gemini belum merespons tepat waktu. Draft lama tetap aman; coba lagi sebentar." },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { error: "Draft belum berhasil diregenerasi. Coba lagi sebentar lagi." },
      { status: 502 },
    );
  }
}
