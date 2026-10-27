import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { runSchedulerJob } from "@/lib/scheduler";

function isAuthorized(request: NextRequest) {
  const secret = process.env.SCHEDULER_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || !authorization?.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(authorization.slice("Bearer ".length));
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function POST(request: NextRequest) {
  if (!process.env.SCHEDULER_SECRET)
    return NextResponse.json({ error: "SCHEDULER_SECRET belum dikonfigurasi." }, { status: 503 });
  if (!isAuthorized(request))
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  try {
    const summary = await runSchedulerJob();
    return NextResponse.json({ ok: true, ...summary });
  } catch {
    console.error("Scheduler job failed.");
    return NextResponse.json({ error: "Scheduler gagal memproses antrean." }, { status: 500 });
  }
}
