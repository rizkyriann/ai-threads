import { timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "threads_studio_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 bytes.");
  }
  return secret;
}

function sessionKey() {
  return new TextEncoder().encode(getSessionSecret());
}

export async function createSessionToken() {
  return new SignJWT({ role: "owner" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer("threads-studio")
    .setAudience("threads-studio-dashboard")
    .setSubject("owner")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(sessionKey());
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), {
      algorithms: ["HS256"],
      issuer: "threads-studio",
      audience: "threads-studio-dashboard",
      subject: "owner",
    });
    return payload.role === "owner";
  } catch {
    return false;
  }
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export function verifyOwnerPassword(candidate: string) {
  const configured = process.env.APP_PASSWORD;
  if (!configured) throw new Error("APP_PASSWORD is not configured.");

  const expected = Buffer.from(configured);
  const actual = Buffer.from(candidate);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function sessionCookieOptions(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const isHttps =
    forwardedProto?.split(",")[0]?.trim() === "https:" ||
    forwardedProto?.split(",")[0]?.trim() === "https" ||
    request.nextUrl.protocol === "https:";

  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: isHttps,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}
