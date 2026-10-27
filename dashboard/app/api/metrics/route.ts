import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const metricFields = ["views", "likes", "replies", "reposts", "quotes"] as const;
type MetricField = (typeof metricFields)[number];

function sumMetric<
  T extends {
    metrics: {
      views: number | null;
      likes: number | null;
      replies: number | null;
      reposts: number | null;
      quotes: number | null;
    }[];
  },
>(posts: T[], field: MetricField) {
  const values = posts.flatMap((post) =>
    post.metrics.length && post.metrics[0][field] !== null
      ? [post.metrics[0][field] as number]
      : [],
  );
  return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
}

export async function GET() {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  try {
    const now = new Date();
    const since30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: since30 } },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        topic: true,
        text: true,
        threadsMediaId: true,
        publishedAt: true,
        isTopPerformance: true,
        metrics: {
          orderBy: { capturedAt: "desc" },
          take: 1,
          select: {
            capturedAt: true,
            views: true,
            likes: true,
            replies: true,
            reposts: true,
            quotes: true,
          },
        },
      },
    });

    function summarize(days: 7 | 30) {
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const cohort = posts.filter((post) => post.publishedAt && post.publishedAt >= cutoff);
      const measured = cohort.filter((post) => post.metrics.length > 0);
      return {
        days,
        publishedPostCount: cohort.length,
        measuredPostCount: measured.length,
        hasData: measured.some((post) =>
          metricFields.some((field) => post.metrics[0][field] !== null),
        ),
        metrics: Object.fromEntries(metricFields.map((field) => [field, sumMetric(cohort, field)])),
      };
    }

    const topPosts = posts
      .filter((post) => post.isTopPerformance && post.metrics.length > 0)
      .sort((a, b) => (b.metrics[0].views ?? -1) - (a.metrics[0].views ?? -1))
      .slice(0, 5)
      .map((post) => ({
        id: post.id,
        topic: post.topic,
        text: post.text,
        threadsMediaId: post.threadsMediaId,
        publishedAt: post.publishedAt,
        metrics: post.metrics[0],
      }));
    const capturedAt =
      posts
        .flatMap((post) => post.metrics.map((metric) => metric.capturedAt))
        .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

    return NextResponse.json({
      periods: { sevenDays: summarize(7), thirtyDays: summarize(30) },
      topPosts,
      capturedAt,
    });
  } catch {
    console.error("Metrics summary query failed.");
    return NextResponse.json({ error: "Ringkasan metrik belum bisa dimuat." }, { status: 503 });
  }
}
