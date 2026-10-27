const DEFAULT_API_BASE = "https://graph.threads.net/v1.0/";

export class ThreadsApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code?: number,
  ) {
    super(message);
    this.name = "ThreadsApiError";
  }
}

async function requestThreads(
  path: string,
  params: Record<string, string>,
  method: "GET" | "POST",
) {
  const base = process.env.THREADS_API_BASE_URL || DEFAULT_API_BASE;
  const url = new URL(path.replace(/^\//, ""), base.endsWith("/") ? base : `${base}/`);
  const requestInit: RequestInit = {
    method,
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  };

  if (method === "GET") {
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  } else {
    requestInit.headers = { "Content-Type": "application/x-www-form-urlencoded" };
    requestInit.body = new URLSearchParams(params);
  }

  let response: Response;
  try {
    response = await fetch(url, requestInit);
  } catch {
    throw new ThreadsApiError("Tidak bisa terhubung ke Threads API.", 503);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ThreadsApiError("Threads API mengembalikan respons yang tidak valid.", 502);
  }

  if (!response.ok) {
    const error = body && typeof body === "object" && "error" in body ? body.error : undefined;
    const apiCode =
      error && typeof error === "object" && "code" in error && typeof error.code === "number"
        ? error.code
        : undefined;
    throw new ThreadsApiError(
      "Threads API menolak permintaan. Periksa token dan izin akun.",
      response.status,
      apiCode,
    );
  }
  return body as Record<string, unknown>;
}

export async function getThreadsProfile(accessToken: string) {
  const body = await requestThreads(
    "me",
    { fields: "id,username", access_token: accessToken },
    "GET",
  );
  if (typeof body.id !== "string" || typeof body.username !== "string") {
    throw new ThreadsApiError("Respons akun Threads tidak memuat ID dan username.", 502);
  }
  return { id: body.id, username: body.username };
}

export async function refreshThreadsToken(accessToken: string) {
  const body = await requestThreads(
    "refresh_access_token",
    { grant_type: "th_refresh_token", access_token: accessToken },
    "GET",
  );
  if (typeof body.access_token !== "string")
    throw new ThreadsApiError("Threads tidak mengembalikan access token baru.", 502);
  return {
    accessToken: body.access_token,
    expiresAt:
      typeof body.expires_in === "number" ? new Date(Date.now() + body.expires_in * 1000) : null,
  };
}

export async function createTextContainer(input: {
  userId: string;
  accessToken: string;
  text: string;
}) {
  const body = await requestThreads(
    `${encodeURIComponent(input.userId)}/threads`,
    {
      media_type: "TEXT",
      text: input.text,
      access_token: input.accessToken,
    },
    "POST",
  );
  if (typeof body.id !== "string")
    throw new ThreadsApiError("Threads tidak mengembalikan ID media container.", 502);
  return body.id;
}

export async function publishContainer(input: {
  userId: string;
  accessToken: string;
  creationId: string;
}) {
  const body = await requestThreads(
    `${encodeURIComponent(input.userId)}/threads_publish`,
    {
      creation_id: input.creationId,
      access_token: input.accessToken,
    },
    "POST",
  );
  if (typeof body.id !== "string")
    throw new ThreadsApiError("Threads tidak mengembalikan ID post yang diterbitkan.", 502);
  return body.id;
}

export async function findRecentlyPublishedPost(input: {
  userId: string;
  accessToken: string;
  text: string;
  scheduledAt: Date;
}) {
  const body = await requestThreads(
    `${encodeURIComponent(input.userId)}/threads`,
    {
      fields: "id,text,timestamp",
      limit: "50",
      access_token: input.accessToken,
    },
    "GET",
  );
  if (!Array.isArray(body.data)) return null;

  const earliest = input.scheduledAt.getTime() - 60_000;
  const latest = Date.now() + 60_000;
  const match = body.data.find((item) => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as { id?: unknown; text?: unknown; timestamp?: unknown };
    if (
      typeof candidate.id !== "string" ||
      candidate.text !== input.text ||
      typeof candidate.timestamp !== "string"
    )
      return false;
    const publishedAt = new Date(candidate.timestamp).getTime();
    return Number.isFinite(publishedAt) && publishedAt >= earliest && publishedAt <= latest;
  }) as { id?: string } | undefined;

  return match?.id ?? null;
}

export type ThreadsInsights = {
  views: number | null;
  likes: number | null;
  replies: number | null;
  reposts: number | null;
  quotes: number | null;
};

export async function getPostInsights(input: {
  mediaId: string;
  accessToken: string;
}): Promise<ThreadsInsights> {
  const body = await requestThreads(
    `${encodeURIComponent(input.mediaId)}/insights`,
    {
      metric: "views,likes,replies,reposts,quotes",
      access_token: input.accessToken,
    },
    "GET",
  );
  const output: ThreadsInsights = {
    views: null,
    likes: null,
    replies: null,
    reposts: null,
    quotes: null,
  };
  if (!Array.isArray(body.data)) return output;

  for (const item of body.data) {
    if (!item || typeof item !== "object") continue;
    const metric = item as { name?: unknown; values?: unknown; total_value?: unknown };
    if (typeof metric.name !== "string" || !(metric.name in output)) continue;
    let raw: unknown;
    if (
      Array.isArray(metric.values) &&
      metric.values[0] &&
      typeof metric.values[0] === "object" &&
      "value" in metric.values[0]
    ) {
      raw = metric.values[0].value;
    } else if (
      metric.total_value &&
      typeof metric.total_value === "object" &&
      "value" in metric.total_value
    ) {
      raw = metric.total_value.value;
    }
    if (typeof raw === "number" && Number.isSafeInteger(raw) && raw >= 0) {
      output[metric.name as keyof ThreadsInsights] = raw;
    }
  }
  return output;
}
