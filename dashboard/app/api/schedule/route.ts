import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  try {
    const [posts, lastJob] = await Promise.all([
      prisma.post.findMany({
        where: { status: { in: ["SCHEDULED", "PUBLISHING", "MISSED", "FAILED"] }, mode: "SCHEDULED" },
        orderBy: [{ scheduledAt: "asc" }, { updatedAt: "desc" }],
        select: { id: true, text: true, topic: true, status: true, scheduledAt: true, retryCount: true, errorMessage: true, updatedAt: true },
      }),
      prisma.jobLog.findFirst({ where: { job: "threads-scheduler" }, orderBy: { startedAt: "desc" }, select: { status: true, startedAt: true, finishedAt: true } }),
    ]);
    const workerOnline = Boolean(lastJob && lastJob.startedAt.getTime() > Date.now() - 2 * 60 * 1000 && lastJob.status !== "FAILED");
    return NextResponse.json({ posts, worker: { online: workerOnline, lastJob } });
  } catch {
    return NextResponse.json({ error: "Antrean jadwal belum bisa dimuat." }, { status: 503 });
  }
}
