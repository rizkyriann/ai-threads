import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getThreadsProfile } from "@/lib/threads-api";
import { prisma } from "@/lib/prisma";
import { decryptThreadsToken } from "@/lib/threads-token";

export async function POST() {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  try {
    const account = await prisma.threadsAccount.findFirst();
    if (!account)
      return NextResponse.json(
        { error: "Belum ada akun Threads yang terhubung." },
        { status: 404 },
      );
    const profile = await getThreadsProfile(decryptThreadsToken(account.encryptedAccessToken));
    if (profile.id !== account.threadsUserId)
      return NextResponse.json(
        { error: "Token mengarah ke akun Threads yang berbeda." },
        { status: 409 },
      );
    return NextResponse.json({ ok: true, username: profile.username });
  } catch {
    return NextResponse.json(
      { error: "Token tidak bisa diverifikasi. Hubungkan ulang akun Threads." },
      { status: 502 },
    );
  }
}
