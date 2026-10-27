import { decryptThreadsToken } from "@/lib/threads-token";
import { getPostInsights, getThreadsProfile } from "@/lib/threads-api";
import { prisma } from "@/lib/prisma";

const METRIC_JOB = "threads-metrics";

function utcSnapshotDate(now: Date) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

async function refreshTopPosts(since: Date) {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", publishedAt: { gte: since } },
    select: {
      id: true,
      metrics: {
        orderBy: { capturedAt: "desc" },
        take: 1,
        select: { views: true, likes: true, replies: true, reposts: true, quotes: true },
      },
    },
  });
  const ranked = posts
    .filter((post) => post.metrics.length > 0)
    .sort((a, b) => {
      const score = (metric: (typeof a.metrics)[number]) =>
        (metric.views ?? 0) +
        (metric.likes ?? 0) * 3 +
        (metric.replies ?? 0) * 4 +
        (metric.reposts ?? 0) * 3 +
        (metric.quotes ?? 0) * 4;
      return score(b.metrics[0]) - score(a.metrics[0]);
    })
    .slice(0, 3)
    .map((post) => post.id);

  await prisma.$transaction([
    prisma.post.updateMany({
      where: { isTopPerformance: true },
      data: { isTopPerformance: false },
    }),
    ...(ranked.length
      ? [
          prisma.post.updateMany({
            where: { id: { in: ranked } },
            data: { isTopPerformance: true },
          }),
        ]
      : []),
  ]);
  return ranked;
}

export async function runMetricsJob() {
  const job = await prisma.jobLog.create({ data: { job: METRIC_JOB, status: "RUNNING" } });
  const capturedAt = new Date();
  const snapshotDate = utcSnapshotDate(capturedAt);
  let captured = 0;
  let failed = 0;

  try {
    const [account, publishedPosts] = await Promise.all([
      prisma.threadsAccount.findFirst({
        select: { threadsUserId: true, encryptedAccessToken: true },
      }),
      prisma.post.findMany({
        where: { status: "PUBLISHED", threadsMediaId: { not: null } },
        orderBy: { publishedAt: "desc" },
        select: { id: true, threadsMediaId: true },
        take: 1000,
      }),
    ]);

    if (!account) throw new Error("Threads account is not connected.");
    const accessToken = decryptThreadsToken(account.encryptedAccessToken);
    await getThreadsProfile(accessToken);

    for (const post of publishedPosts) {
      if (!post.threadsMediaId) continue;
      try {
        const insights = await getPostInsights({ mediaId: post.threadsMediaId, accessToken });
        await prisma.metricSnapshot.upsert({
          where: { postId_snapshotDate: { postId: post.id, snapshotDate } },
          create: { postId: post.id, snapshotDate, capturedAt, ...insights },
          update: { capturedAt, ...insights },
        });
        captured += 1;
      } catch {
        failed += 1;
      }
    }

    const topPostIds = await refreshTopPosts(
      new Date(capturedAt.getTime() - 30 * 24 * 60 * 60 * 1000),
    );
    const detail = { captured, failed, topPostIds };
    await prisma.jobLog.update({
      where: { id: job.id },
      data: {
        status: failed ? "FAILED" : "SUCCEEDED",
        finishedAt: new Date(),
        detail: JSON.stringify(detail),
      },
    });
    return detail;
  } catch {
    await prisma.jobLog.update({
      where: { id: job.id },
      data: { status: "FAILED", finishedAt: new Date(), detail: "Metrics collection failed." },
    });
    throw new Error("Metrics collection failed.");
  }
}

export async function runMetricsIfDue(now = new Date()) {
  const previous = await prisma.jobLog.findFirst({
    where: { job: METRIC_JOB },
    orderBy: { startedAt: "desc" },
    select: { startedAt: true, status: true },
  });
  if (previous) {
    const elapsed = now.getTime() - previous.startedAt.getTime();
    if (previous.status === "SUCCEEDED" && elapsed < 24 * 60 * 60 * 1000) return null;
    if (previous.status === "RUNNING" && elapsed < 30 * 60 * 1000) return null;
    if (previous.status === "FAILED" && elapsed < 60 * 60 * 1000) return null;
  }
  return runMetricsJob();
}
