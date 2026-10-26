"use client";

import { useEffect, useState } from "react";
import { Eye, Heart, MessageCircle, Repeat2, Quote, Sparkles } from "lucide-react";

type MetricValues = { views: number | null; likes: number | null; replies: number | null; reposts: number | null; quotes: number | null };
type PeriodSummary = { days: number; publishedPostCount: number; measuredPostCount: number; hasData: boolean; metrics: MetricValues };
type TopPost = { id: string; topic: string; text: string; threadsMediaId: string | null; publishedAt: string | null; metrics: MetricValues & { capturedAt: string } };
type MetricsResponse = { periods: { sevenDays: PeriodSummary; thirtyDays: PeriodSummary }; topPosts: TopPost[]; capturedAt: string | null };

const metricCards = [
  { key: "views", label: "Views", icon: Eye },
  { key: "likes", label: "Likes", icon: Heart },
  { key: "replies", label: "Replies", icon: MessageCircle },
  { key: "reposts", label: "Reposts", icon: Repeat2 },
  { key: "quotes", label: "Quotes", icon: Quote },
] as const;

function number(value: number | null) {
  return value === null ? "—" : new Intl.NumberFormat("id-ID", { notation: value >= 10_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function MetricPeriodCards({ period }: { period: PeriodSummary }) {
  return (
    <section className="metric-period-block" aria-label={`Metrik ${period.days} hari`}>
      <div className="metric-period-heading"><div><div className="section-kicker">PERFORMA KONTEN</div><h2>{period.days} hari terakhir</h2></div><span>{period.publishedPostCount} post dipublikasikan</span></div>
      {!period.hasData ? <div className="metric-no-data"><span>{period.publishedPostCount ? "Snapshot metrik belum tersedia untuk periode ini." : "Belum ada post yang dipublikasikan pada periode ini."}</span></div> : (
        <div className="metric-cards-grid">{metricCards.map(({ key, label, icon: Icon }) => <article className="metric-data-card" key={`${period.days}-${key}`}><span className="metric-data-icon"><Icon size={16} /></span><span className="metric-data-label">{label}</span><strong>{number(period.metrics[key])}</strong><small>post dalam {period.days} hari</small></article>)}</div>
      )}
      <p className="metric-coverage">Data tersedia untuk {period.measuredPostCount} dari {period.publishedPostCount} post.</p>
    </section>
  );
}

export function MetricsDashboard({ full = false }: { full?: boolean }) {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/metrics", { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Metrik belum bisa dimuat.");
      return body as MetricsResponse;
    }).then((body) => { if (!cancelled) setData(body); })
      .catch((loadError: unknown) => { if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Metrik belum bisa dimuat."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className={`metrics-loading${full ? " metrics-loading-full" : ""}`} role="status">Memuat ringkasan metrik…</div>;
  if (error) return <div className="metrics-error" role="alert">{error}</div>;
  if (!data) return null;

  const topPosts = full ? data.topPosts : data.topPosts.slice(0, 3);
  return (
    <section className={`metrics-dashboard${full ? " metrics-dashboard-full" : " metrics-dashboard-preview"}`}>
      {full && <header className="metrics-page-header"><div className="section-kicker">FEEDBACK LOOP</div><h1>Performa konten</h1><p>Ringkasan performa post Threads berdasarkan snapshot dari Insights API.</p></header>}
      <div className="metrics-period-grid"><MetricPeriodCards period={data.periods.sevenDays} /><MetricPeriodCards period={data.periods.thirtyDays} /></div>
      {topPosts.length > 0 ? <section className="top-posts-section"><div className="section-heading"><div><div className="section-kicker">PEMBELAJARAN</div><h2><Sparkles size={17} /> Post dengan performa terbaik</h2></div></div><div className="top-posts-list">{topPosts.map((post, index) => <article className="top-post-card" key={post.id}><span className="top-post-rank">{String(index + 1).padStart(2, "0")}</span><div className="top-post-content"><div className="top-post-heading"><strong>{post.topic || "Post Threads"}</strong><span>{number(post.metrics.views)} views</span></div><p>{post.text}</p><small>{post.publishedAt ? `Tayang ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(post.publishedAt))}` : "Tanggal tayang tidak tersedia"}</small></div></article>)}</div></section> : <div className="metric-best-empty">Post dengan metrik akan muncul di sini setelah Insights API berhasil mengambil snapshot.</div>}
      <p className="metrics-updated">{data.capturedAt ? `Snapshot terakhir ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(data.capturedAt))} WIB.` : "Metrik diperbarui otomatis setiap hari saat worker berjalan."}</p>
    </section>
  );
}
