"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, Check, CircleAlert, Clock3, RefreshCw, X } from "lucide-react";
import { formatJakartaDateTime, toJakartaDateTimeInput } from "@/lib/jakarta-time";

type ScheduledPost = {
  id: string;
  text: string;
  topic: string;
  status: "SCHEDULED" | "PUBLISHING" | "MISSED" | "FAILED";
  scheduledAt: string | null;
  retryCount: number;
  errorMessage: string | null;
  updatedAt: string;
};
type WorkerStatus = { online: boolean; lastJob: { status: "RUNNING" | "SUCCEEDED" | "FAILED"; startedAt: string; finishedAt: string | null } | null };

function ScheduledPostCard({ post, onCancel, onUpdate, busy }: { post: ScheduledPost; onCancel: (post: ScheduledPost) => void; onUpdate: (post: ScheduledPost, value: string) => void; busy: boolean }) {
  const [editing, setEditing] = useState(false);
  const [newTime, setNewTime] = useState(() => post.scheduledAt ? toJakartaDateTimeInput(post.scheduledAt) : "");
  const statusLabel = post.status === "SCHEDULED" ? "Terjadwal" : post.status === "PUBLISHING" ? "Sedang diterbitkan" : post.status === "MISSED" ? "Terlewat" : "Gagal";

  return (
    <article className="schedule-post-card">
      <div className="schedule-post-top"><span className={`status-pill ${post.status === "SCHEDULED" ? "status-ready" : post.status === "PUBLISHING" ? "status-publishing" : "status-failed"}`}><span />{statusLabel}</span><span className="schedule-retry-count">{post.retryCount ? `Percobaan ${post.retryCount}` : "Antrean"}</span></div>
      <h2>{post.topic || "Post Threads"}</h2>
      <p className="schedule-post-text">{post.text}</p>
      {post.scheduledAt && <div className="schedule-post-time"><CalendarClock size={15} /><span>{formatJakartaDateTime(post.scheduledAt)} WIB</span></div>}
      {post.errorMessage && <div className="schedule-post-error"><CircleAlert size={14} />{post.errorMessage}</div>}
      {post.status === "SCHEDULED" ? (editing ? (
        <div className="schedule-edit-row"><label className="sr-only" htmlFor={`reschedule-${post.id}`}>Ubah waktu tayang (WIB)</label><input id={`reschedule-${post.id}`} type="datetime-local" value={newTime} min={toJakartaDateTimeInput(new Date(Date.now() + 60_000))} onChange={(event) => setNewTime(event.target.value)} /><button className="button-primary" disabled={busy || !newTime} onClick={() => onUpdate(post, newTime)}><Check size={14} /> Simpan</button><button className="icon-button" aria-label="Tutup pengeditan" onClick={() => setEditing(false)}><X size={16} /></button></div>
      ) : (
        <div className="schedule-post-actions"><button className="button-quiet" onClick={() => setEditing(true)}><Clock3 size={14} /> Ubah waktu</button><button className="button-danger-quiet" disabled={busy} onClick={() => onCancel(post)}><X size={14} /> Batalkan</button></div>
      )) : post.status === "PUBLISHING" ? <p className="schedule-action-note">Worker sedang memproses post ini.</p> : <p className="schedule-action-note">Perlu ditinjau sebelum tindakan lanjutan.</p>}
    </article>
  );
}

export function ScheduleManager() {
  const router = useRouter();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [worker, setWorker] = useState<WorkerStatus | null>(null);

  async function loadPosts() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/schedule", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Antrean belum bisa dimuat.");
      setPosts(body.posts);
      setWorker(body.worker);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Antrean belum bisa dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadPosts(); }, []);

  async function updateSchedule(post: ScheduledPost, scheduledAt: string) {
    setBusyId(post.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/posts/${post.id}/schedule`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scheduledAt }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Jadwal belum berhasil diubah.");
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, scheduledAt: body.post.scheduledAt, updatedAt: body.post.updatedAt } : item));
      setNotice("Waktu tayang berhasil diperbarui.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Jadwal belum berhasil diubah.");
    } finally {
      setBusyId(null);
    }
  }

  async function cancelSchedule(post: ScheduledPost) {
    if (!window.confirm(`Batalkan jadwal “${post.topic || "Post Threads"}”?`)) return;
    setBusyId(post.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/posts/${post.id}/schedule`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Jadwal belum bisa dibatalkan.");
      setPosts((current) => current.filter((item) => item.id !== post.id));
      setNotice("Jadwal dibatalkan; status post diperbarui.");
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Jadwal belum bisa dibatalkan.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="schedule-page">
      <header className="schedule-page-header"><button className="profile-back" onClick={() => router.push("/")}><ArrowLeft size={16} /> Kembali ke dashboard</button><div className="schedule-title-row"><div><div className="section-kicker">ANTREAN KONTEN</div><h1>Jadwal publikasi</h1><p>Atur waktu tayang post dalam zona Asia/Jakarta.</p></div><button className="icon-button" onClick={() => void loadPosts()} aria-label="Muat ulang jadwal" disabled={loading}><RefreshCw size={17} className={loading ? "spin-icon" : ""} /></button></div></header>
      <div className={`schedule-worker-note${worker?.online ? " worker-online" : " worker-offline"}`}><Clock3 size={16} /><span>{worker?.online ? `Worker aktif · pemeriksaan terakhir ${worker.lastJob ? formatJakartaDateTime(worker.lastJob.startedAt) : "baru saja"} WIB.` : "Worker belum terlihat aktif. Jadwal tidak akan dipublikasikan sampai scheduler dijalankan setiap menit."} Waktu jadwal disimpan sebagai UTC.</span></div>
      {error && <div className="settings-alert settings-alert-error" role="alert"><CircleAlert size={15} />{error}</div>}
      {notice && <div className="settings-alert settings-alert-success" role="status"><Check size={15} />{notice}</div>}
      {loading ? <div className="draft-loading" role="status">Memuat antrean…</div> : posts.length ? <div className="schedule-list">{posts.map((post) => <ScheduledPostCard key={post.id} post={post} onCancel={cancelSchedule} onUpdate={updateSchedule} busy={busyId === post.id} />)}</div> : <div className="schedule-empty"><div className="empty-icon"><CalendarClock size={20} /></div><strong>Belum ada post terjadwal</strong><span>Setujui draft dan pilih waktu tayang dari beranda.</span><button className="button-quiet" onClick={() => router.push("/")}>Lihat draft</button></div>}
    </main>
  );
}
