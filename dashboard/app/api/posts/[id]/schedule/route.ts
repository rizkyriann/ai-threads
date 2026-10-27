import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { parseJakartaDateTime } from "@/lib/jakarta-time";
import { prisma } from "@/lib/prisma";

const scheduleSchema = z.object({ scheduledAt: z.string().min(16).max(16) });

function readScheduledAt(value: string) {
  const date = parseJakartaDateTime(value);
  if (!date) return null;
  if (date.getTime() < Date.now() + 60_000) return null;
  return date;
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Waktu jadwal tidak valid." }, { status: 400 });
  }
  const parsed = scheduleSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Pilih tanggal dan waktu jadwal." }, { status: 400 });
  const scheduledAt = readScheduledAt(parsed.data.scheduledAt);
  if (!scheduledAt)
    return NextResponse.json(
      { error: "Jadwal harus setidaknya satu menit dari sekarang (WIB)." },
      { status: 400 },
    );

  const { id } = await context.params;
  const account = await prisma.threadsAccount.findFirst({ select: { id: true } });
  if (!account)
    return NextResponse.json(
      { error: "Hubungkan akun Threads sebelum menjadwalkan post." },
      { status: 409 },
    );

  const result = await prisma.post.updateMany({
    where: { id, status: "DRAFT" },
    data: {
      status: "SCHEDULED",
      mode: "SCHEDULED",
      scheduledAt,
      retryCount: 0,
      errorMessage: null,
    },
  });
  if (result.count !== 1)
    return NextResponse.json(
      { error: "Draft tidak ditemukan atau sudah diproses." },
      { status: 409 },
    );
  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true, status: true, scheduledAt: true, text: true, topic: true, updatedAt: true },
  });
  return NextResponse.json({ post }, { status: 201 });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Waktu jadwal tidak valid." }, { status: 400 });
  }
  const parsed = scheduleSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Pilih tanggal dan waktu jadwal." }, { status: 400 });
  const scheduledAt = readScheduledAt(parsed.data.scheduledAt);
  if (!scheduledAt)
    return NextResponse.json(
      { error: "Jadwal harus setidaknya satu menit dari sekarang (WIB)." },
      { status: 400 },
    );

  try {
    const { id } = await context.params;
    const result = await prisma.post.updateMany({
      where: { id, status: "SCHEDULED" },
      data: { scheduledAt },
    });
    if (result.count !== 1)
      return NextResponse.json(
        { error: "Jadwal tidak ditemukan atau sedang diproses." },
        { status: 409 },
      );
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        text: true,
        topic: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ post });
  } catch (error) {
    console.error("Scheduled post update failed.", error);
    return NextResponse.json(
      { error: "Jadwal belum bisa diubah. Periksa koneksi database lalu coba lagi." },
      { status: 503 },
    );
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  const { id } = await context.params;
  const result = await prisma.post.updateMany({
    where: { id, status: "SCHEDULED" },
    data: { status: "CANCELED" },
  });
  if (result.count !== 1)
    return NextResponse.json(
      { error: "Jadwal tidak ditemukan atau sudah diproses." },
      { status: 409 },
    );
  return NextResponse.json({ ok: true, status: "CANCELED" });
}
