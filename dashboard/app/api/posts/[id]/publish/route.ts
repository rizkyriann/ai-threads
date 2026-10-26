import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { createTextContainer, publishContainer, ThreadsApiError } from "@/lib/threads-api";
import { prisma } from "@/lib/prisma";
import { decryptThreadsToken } from "@/lib/threads-token";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  const { id } = await context.params;

  const [post, account] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.threadsAccount.findFirst(),
  ]);
  if (!post || post.status !== "DRAFT") return NextResponse.json({ error: "Draft tidak ditemukan atau sudah diproses." }, { status: 409 });
  if (!account) return NextResponse.json({ error: "Hubungkan akun Threads sebelum mempublikasikan." }, { status: 409 });

  let accessToken: string;
  try {
    accessToken = decryptThreadsToken(account.encryptedAccessToken);
  } catch {
    return NextResponse.json({ error: "Token Threads tidak bisa dibuka. Hubungkan ulang akun." }, { status: 503 });
  }

  const claim = await prisma.post.updateMany({
    where: { id, status: "DRAFT" },
    data: { status: "PUBLISHING", idempotencyKey: randomUUID(), errorMessage: null },
  });
  if (claim.count !== 1) return NextResponse.json({ error: "Post sedang diproses oleh permintaan lain." }, { status: 409 });

  try {
    const containerId = post.threadsContainerId || await createTextContainer({ userId: account.threadsUserId, accessToken, text: post.text });
    if (!post.threadsContainerId) {
      await prisma.post.update({ where: { id }, data: { threadsContainerId: containerId } });
    }
    const mediaId = await publishContainer({ userId: account.threadsUserId, accessToken, creationId: containerId });
    await prisma.post.update({
      where: { id },
      data: { status: "PUBLISHED", threadsMediaId: mediaId, publishedAt: new Date(), errorMessage: null },
    });
    return NextResponse.json({ ok: true, status: "PUBLISHED", threadsMediaId: mediaId, username: account.username });
  } catch (error) {
    await prisma.post.update({ where: { id }, data: { status: "FAILED", errorMessage: "Threads API publish failed." } });
    console.error("Manual Threads publish failed.");
    const status = error instanceof ThreadsApiError && error.statusCode === 429 ? 429 : 502;
    return NextResponse.json({ error: "Threads belum mengonfirmasi publikasi. Draft ditandai gagal; verifikasi akun sebelum mencoba lagi." }, { status });
  }
}
