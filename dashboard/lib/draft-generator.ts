import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const generatedSchema = z.object({
  drafts: z.array(z.object({ text: z.string().trim().min(1).max(500), topic: z.string().trim().min(1).max(191), tone: z.string().trim().min(1).max(40) })).min(1).max(5),
});

export type GeneratedDraft = z.infer<typeof generatedSchema>["drafts"][number];

export function isGeminiTimeout(error: unknown) {
  if (!error || typeof error !== "object" || !("status" in error)) return false;
  return error.status === 408 || error.status === 504;
}

export async function generateDrafts(input: { idea: string; count: number; profileVersionId?: number | null }) {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured.");

  const profile = input.profileVersionId
    ? await prisma.profileVersion.findUnique({ where: { id: input.profileVersionId } })
    : await prisma.profileVersion.findFirst({ orderBy: { version: "desc" } });
  const examples = profile
    ? await prisma.examplePost.findMany({ where: { profileVersionId: profile.id }, orderBy: [{ isTop: "desc" }, { id: "asc" }], take: 8 })
    : [];
  const topPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED", isTopPerformance: true },
    orderBy: { publishedAt: "desc" },
    select: { text: true },
    take: 3,
  });
  const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { timeout: 45_000, retryOptions: { attempts: 2, initialDelay: 1, maxDelay: 5 } },
  });
  const response = await client.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-flash-lite-latest",
    contents: [
      "Kamu membantu pemilik akun Threads menulis post berbahasa Indonesia yang alami, spesifik, dan terdengar seperti manusia.",
      "Buat post tunggal, bukan thread. Setiap teks maksimal 500 karakter. Jangan gunakan hashtag kecuali diminta.",
      "Jangan mengarang pengalaman pribadi sebagai fakta; ubah ide menjadi sudut pandang yang dapat diedit pemilik.",
      profile ? `Profil penulis: niche ${profile.niche}; topik ${profile.topics}; audiens ${profile.audience}; nada ${profile.tone}; bahasa ${profile.language}; aturan ${profile.rules}.` : "Belum ada content profile; tulis dalam Bahasa Indonesia yang lugas dan hangat.",
      examples.length ? `Contoh tulisan pilihan sebagai referensi gaya (jangan disalin):\n${examples.map((example) => `- ${example.text}`).join("\n")}` : "Belum ada contoh tulisan tersimpan.",
      topPosts.length ? `Contoh post publikasi dengan performa terbaik (gunakan sebagai referensi kualitas, jangan disalin):\n${topPosts.map((post) => `- ${post.text}`).join("\n")}` : "Belum ada data post performa terbaik.",
      `Kembangkan ide berikut menjadi tepat ${input.count} alternatif post Threads yang berbeda:`,
      input.idea,
    ].join("\n\n"),
    config: {
      temperature: 0.85,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          drafts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { text: { type: Type.STRING }, topic: { type: Type.STRING }, tone: { type: Type.STRING } },
              required: ["text", "topic", "tone"],
            },
          },
        },
        required: ["drafts"],
      },
    },
  });

  const content = response.text;
  if (!content) throw new Error("Gemini returned an empty response.");
  const result = generatedSchema.parse(JSON.parse(content));
  if (result.drafts.length !== input.count) throw new Error("Gemini returned an unexpected number of drafts.");
  return { drafts: result.drafts, profileVersionId: profile?.id ?? null };
}
