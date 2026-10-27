import { decryptThreadsToken } from "@/lib/threads-token";
import {
  createTextContainer,
  findRecentlyPublishedPost,
  publishContainer,
  ThreadsApiError,
} from "@/lib/threads-api";
import { runMetricsIfDue } from "@/lib/metrics";
import { prisma } from "@/lib/prisma";

const CATCH_UP_WINDOW_MS = 2 * 60 * 60 * 1000;
const STALE_PUBLISHING_MS = 5 * 60 * 1000;
const MAX_RETRIES = 3;
const BATCH_SIZE = 10;

type ScheduledItem = {
  id: string;
  text: string;
  scheduledAt: Date | null;
  retryCount: number;
  threadsContainerId: string | null;
  status: "SCHEDULED" | "FAILED";
};

async function markPublished(postId: string, mediaId: string) {
  await prisma.post.update({
    where: { id: postId },
    data: {
      status: "PUBLISHED",
      threadsMediaId: mediaId,
      publishedAt: new Date(),
      errorMessage: null,
      nextRetryAt: null,
    },
  });
}

async function reconcileStalePublishing(account: {
  threadsUserId: string;
  encryptedAccessToken: string;
}) {
  const olderThan = new Date(Date.now() - STALE_PUBLISHING_MS);
  const stalePosts = await prisma.post.findMany({
    where: { status: "PUBLISHING", mode: "SCHEDULED", updatedAt: { lt: olderThan } },
    select: { id: true, text: true, scheduledAt: true },
    take: BATCH_SIZE,
  });
  let reconciled = 0;
  const accessToken = decryptThreadsToken(account.encryptedAccessToken);

  for (const post of stalePosts) {
    if (!post.scheduledAt) continue;
    try {
      const mediaId = await findRecentlyPublishedPost({
        userId: account.threadsUserId,
        accessToken,
        text: post.text,
        scheduledAt: post.scheduledAt,
      });
      if (mediaId) {
        const result = await prisma.post.updateMany({
          where: { id: post.id, status: "PUBLISHING" },
          data: {
            status: "PUBLISHED",
            threadsMediaId: mediaId,
            publishedAt: new Date(),
            errorMessage: null,
            nextRetryAt: null,
          },
        });
        if (result.count) reconciled += 1;
      } else {
        await prisma.post.updateMany({
          where: { id: post.id, status: "PUBLISHING" },
          data: {
            status: "FAILED",
            retryCount: MAX_RETRIES,
            nextRetryAt: null,
            errorMessage:
              "Hasil publish setelah worker restart belum dapat dipastikan. Periksa akun Threads sebelum tindakan manual.",
          },
        });
      }
    } catch {
      // If Threads cannot be checked, keep PUBLISHING. A later worker pass can reconcile safely.
    }
  }
  return reconciled;
}

async function getDueItems(now: Date): Promise<ScheduledItem[]> {
  const catchUpStart = new Date(now.getTime() - CATCH_UP_WINDOW_MS);
  const scheduled = await prisma.post.findMany({
    where: { mode: "SCHEDULED", status: "SCHEDULED", scheduledAt: { lte: now, gte: catchUpStart } },
    orderBy: { scheduledAt: "asc" },
    take: BATCH_SIZE,
    select: {
      id: true,
      text: true,
      scheduledAt: true,
      retryCount: true,
      threadsContainerId: true,
      status: true,
    },
  });

  const retries = await prisma.post.findMany({
    where: {
      mode: "SCHEDULED",
      status: "FAILED",
      retryCount: { lt: MAX_RETRIES },
      nextRetryAt: { lte: now },
    },
    orderBy: { scheduledAt: "asc" },
    take: Math.max(0, BATCH_SIZE - scheduled.length),
    select: {
      id: true,
      text: true,
      scheduledAt: true,
      retryCount: true,
      threadsContainerId: true,
      status: true,
    },
  });
  return [
    ...scheduled.map((post) => ({ ...post, status: "SCHEDULED" as const })),
    ...retries.map((post) => ({ ...post, status: "FAILED" as const })),
  ];
}

async function processOne(
  item: ScheduledItem,
  account: { threadsUserId: string; encryptedAccessToken: string },
) {
  const claim = await prisma.post.updateMany({
    where: { id: item.id, status: item.status, retryCount: item.retryCount },
    data: { status: "PUBLISHING", nextRetryAt: null, errorMessage: null },
  });
  if (claim.count !== 1) return "skipped" as const;

  let accessToken: string;
  try {
    accessToken = decryptThreadsToken(account.encryptedAccessToken);
  } catch {
    await prisma.post.update({
      where: { id: item.id },
      data: {
        status: "FAILED",
        retryCount: MAX_RETRIES,
        errorMessage: "Token Threads tidak dapat didekripsi; hubungkan ulang akun.",
      },
    });
    return "failed" as const;
  }

  let publishAttempted = false;
  try {
    if (!item.scheduledAt) throw new Error("Scheduled post has no scheduledAt value.");
    const containerId =
      item.threadsContainerId ||
      (await createTextContainer({ userId: account.threadsUserId, accessToken, text: item.text }));
    if (!item.threadsContainerId) {
      await prisma.post.update({
        where: { id: item.id },
        data: { threadsContainerId: containerId },
      });
    }
    publishAttempted = true;
    const mediaId = await publishContainer({
      userId: account.threadsUserId,
      accessToken,
      creationId: containerId,
    });
    await markPublished(item.id, mediaId);
    return "published" as const;
  } catch (error) {
    // Container creation alone does not publish content, so a failed create can be retried safely.
    if (!publishAttempted && item.retryCount < MAX_RETRIES) {
      const retryCount = item.retryCount + 1;
      const delayMs = 60_000 * 2 ** (retryCount - 1);
      await prisma.post.update({
        where: { id: item.id },
        data: {
          status: "FAILED",
          retryCount,
          nextRetryAt: new Date(Date.now() + delayMs),
          errorMessage: "Koneksi Threads bermasalah; akan dicoba lagi otomatis.",
        },
      });
      return "retrying" as const;
    }

    // A 429 confirms the publish was rejected and is safe to retry with backoff.
    if (
      error instanceof ThreadsApiError &&
      error.statusCode === 429 &&
      item.retryCount < MAX_RETRIES
    ) {
      const retryCount = item.retryCount + 1;
      const delayMs = 60_000 * 2 ** (retryCount - 1);
      await prisma.post.update({
        where: { id: item.id },
        data: {
          status: "FAILED",
          retryCount,
          nextRetryAt: new Date(Date.now() + delayMs),
          errorMessage: "Threads membatasi permintaan; akan dicoba lagi otomatis.",
        },
      });
      return "retrying" as const;
    }

    // For an ambiguous timeout, reconcile before retrying to avoid duplicate publication.
    if (item.scheduledAt) {
      try {
        const mediaId = await findRecentlyPublishedPost({
          userId: account.threadsUserId,
          accessToken,
          text: item.text,
          scheduledAt: item.scheduledAt,
        });
        if (mediaId) {
          await markPublished(item.id, mediaId);
          return "published" as const;
        }
      } catch {
        // The result remains unknown. Mark for review instead of republishing blindly.
      }
    }

    const ambiguous = !(error instanceof ThreadsApiError) || error.statusCode >= 500;
    await prisma.post.update({
      where: { id: item.id },
      data: {
        status: "FAILED",
        retryCount: ambiguous ? MAX_RETRIES : item.retryCount,
        nextRetryAt: null,
        errorMessage: ambiguous
          ? "Status publish belum dapat dipastikan. Periksa akun Threads untuk mencegah post ganda."
          : "Threads API menolak post. Periksa izin token dan isi post.",
      },
    });
    return "failed" as const;
  }
}

export async function runSchedulerJob() {
  const job = await prisma.jobLog.create({ data: { job: "threads-scheduler", status: "RUNNING" } });
  const now = new Date();
  const catchUpStart = new Date(now.getTime() - CATCH_UP_WINDOW_MS);
  try {
    const missed = await prisma.post.updateMany({
      where: { mode: "SCHEDULED", status: "SCHEDULED", scheduledAt: { lt: catchUpStart } },
      data: {
        status: "MISSED",
        errorMessage: "Waktu jadwal terlewat lebih dari batas catch-up 2 jam.",
      },
    });
    const account = await prisma.threadsAccount.findFirst({
      select: { threadsUserId: true, encryptedAccessToken: true },
    });
    if (!account) {
      const summary = {
        processed: 0,
        missed: missed.count,
        reconciled: 0,
        published: 0,
        retrying: 0,
        failed: 0,
        skipped: 0,
        reason: "Threads account not connected",
      };
      await prisma.jobLog.update({
        where: { id: job.id },
        data: { status: "SUCCEEDED", finishedAt: new Date(), detail: JSON.stringify(summary) },
      });
      return summary;
    }

    const reconciled = await reconcileStalePublishing(account);
    const due = await getDueItems(now);
    const counts = { published: 0, retrying: 0, failed: 0, skipped: 0 };
    for (const item of due) counts[await processOne(item, account)] += 1;

    let metrics: "captured" | "failed" | "not-due" = "not-due";
    try {
      if (await runMetricsIfDue(now)) metrics = "captured";
    } catch {
      metrics = "failed";
    }

    const summary = { processed: due.length, missed: missed.count, reconciled, metrics, ...counts };
    await prisma.jobLog.update({
      where: { id: job.id },
      data: { status: "SUCCEEDED", finishedAt: new Date(), detail: JSON.stringify(summary) },
    });
    return summary;
  } catch {
    await prisma.jobLog.update({
      where: { id: job.id },
      data: { status: "FAILED", finishedAt: new Date(), detail: "Scheduler run failed." },
    });
    throw new Error("Scheduler run failed.");
  }
}
