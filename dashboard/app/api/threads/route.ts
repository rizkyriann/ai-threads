import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { getThreadsProfile } from "@/lib/threads-api";
import { prisma } from "@/lib/prisma";
import { encryptThreadsToken } from "@/lib/threads-token";

const connectSchema = z.object({ accessToken: z.string().trim().min(20).max(8192) });

export async function GET() {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  try {
    const account = await prisma.threadsAccount.findFirst({
      select: { threadsUserId: true, username: true, tokenExpiresAt: true, connectedAt: true },
    });
    return NextResponse.json({ connected: Boolean(account), account });
  } catch {
    return NextResponse.json(
      { error: "Status koneksi Threads belum bisa dimuat." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data koneksi tidak valid." }, { status: 400 });
  }
  const parsed = connectSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Masukkan access token Threads yang valid." },
      { status: 400 },
    );

  try {
    const account = await getThreadsProfile(parsed.data.accessToken);
    const encryptedAccessToken = encryptThreadsToken(parsed.data.accessToken);
    await prisma.$transaction(async (tx) => {
      await tx.threadsAccount.deleteMany();
      await tx.threadsAccount.create({
        data: { threadsUserId: account.id, username: account.username, encryptedAccessToken },
      });
    });
    return NextResponse.json(
      {
        connected: true,
        account: { threadsUserId: account.id, username: account.username, tokenExpiresAt: null },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("THREADS_TOKEN_ENCRYPTION_KEY")) {
      const message = error.message.includes("32-byte")
        ? "THREADS_TOKEN_ENCRYPTION_KEY harus berupa base64 dari tepat 32 byte acak."
        : "THREADS_TOKEN_ENCRYPTION_KEY belum dikonfigurasi di server.";
      return NextResponse.json({ error: message }, { status: 503 });
    }
    console.error("Threads account connection failed.");
    return NextResponse.json(
      { error: "Tidak bisa menghubungkan akun. Periksa token dan izin Threads API." },
      { status: 502 },
    );
  }
}

export async function DELETE() {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  try {
    await prisma.threadsAccount.deleteMany();
    return NextResponse.json({ connected: false });
  } catch {
    return NextResponse.json({ error: "Koneksi Threads belum bisa dihapus." }, { status: 503 });
  }
}
