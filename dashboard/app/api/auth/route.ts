import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  isAuthenticated,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyOwnerPassword,
} from "@/lib/auth";

const loginSchema = z.object({ password: z.string().min(1).max(256) });

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Permintaan login tidak valid." },
      { status: 400 },
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Masukkan password." }, { status: 400 });

  try {
    if (!verifyOwnerPassword(parsed.data.password)) {
      return NextResponse.json(
        { error: "Password tidak cocok." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      SESSION_COOKIE,
      await createSessionToken(),
      sessionCookieOptions,
    );
    return response;
  } catch (error) {
    console.error("Login configuration error.");
    const message =
      error instanceof Error && error.message.includes("SESSION_SECRET")
        ? "SESSION_SECRET harus berisi minimal 32 byte acak. Perbarui .env lalu restart server."
        : "APP_PASSWORD belum diatur dengan benar di .env.";
    return NextResponse.json(
      { error: message },
      { status: 503 },
    );
  }
}

export async function DELETE() {
  const authenticated = await isAuthenticated();
  if (!authenticated)
    return NextResponse.json(
      { error: "Tidak terautentikasi." },
      { status: 401 },
    );

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions,
    maxAge: 0,
  });
  return response;
}
