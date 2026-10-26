import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { refreshThreadsToken } from "@/lib/threads-api";
import { prisma } from "@/lib/prisma";
import { decryptThreadsToken, encryptThreadsToken } from "@/lib/threads-token";

export async function POST() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  try {
    const account = await prisma.threadsAccount.findFirst();
    if (!account) return NextResponse.json({ error: "Belum ada akun Threads yang terhubung." }, { status: 404 });
    const refreshed = await refreshThreadsToken(decryptThreadsToken(account.encryptedAccessToken));
    const encryptedAccessToken = encryptThreadsToken(refreshed.accessToken);
    await prisma.threadsAccount.update({
      where: { id: account.id },
      data: { encryptedAccessToken, tokenExpiresAt: refreshed.expiresAt },
    });
    return NextResponse.json({ ok: true, tokenExpiresAt: refreshed.expiresAt });
  } catch {
    return NextResponse.json({ error: "Token tidak berhasil diperbarui. Hubungkan ulang akun Threads." }, { status: 502 });
  }
}
