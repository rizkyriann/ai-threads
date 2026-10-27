"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CircleAlert, Clock3, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatJakartaDateTime } from "@/lib/jakarta-time";
import { readApiResponse } from "@/lib/api-response";
import { ScheduledPostRow, type ScheduledPost } from "@/components/schedule/scheduled-post-row";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

type WorkerStatus = {
  online: boolean;
  lastJob: {
    status: "RUNNING" | "SUCCEEDED" | "FAILED";
    startedAt: string;
    finishedAt: string | null;
  } | null;
};

export function ScheduleManager() {
  const router = useRouter();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelCandidate, setCancelCandidate] = useState<ScheduledPost | null>(null);
  const [worker, setWorker] = useState<WorkerStatus | null>(null);

  async function loadPosts() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/schedule", { cache: "no-store" });
      const body = await readApiResponse<{
        error?: string;
        posts: ScheduledPost[];
        worker: WorkerStatus;
      }>(response);
      if (!response.ok) throw new Error(body.error || "Antrean belum bisa dimuat.");
      setPosts(body.posts);
      setWorker(body.worker);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Antrean belum bisa dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  async function updateSchedule(post: ScheduledPost, scheduledAt: string) {
    setBusyId(post.id);
    setError("");
    try {
      const response = await fetch(`/api/posts/${post.id}/schedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt }),
      });
      const body = await readApiResponse<{
        error?: string;
        post?: { scheduledAt: string; updatedAt: string };
      }>(response);
      if (!response.ok) throw new Error(body.error || "Jadwal belum berhasil diubah.");
      if (!body.post) throw new Error("Response perubahan jadwal tidak lengkap.");
      const updatedPost = body.post;
      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? { ...item, scheduledAt: updatedPost.scheduledAt, updatedAt: updatedPost.updatedAt }
            : item,
        ),
      );
      toast.success("Waktu tayang berhasil diperbarui.");
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Jadwal belum berhasil diubah.",
      );
      toast.error(
        updateError instanceof Error ? updateError.message : "Jadwal belum berhasil diubah.",
      );
    } finally {
      setBusyId(null);
    }
  }

  function cancelSchedule(post: ScheduledPost) {
    setCancelCandidate(post);
  }

  async function confirmCancelSchedule(post: ScheduledPost) {
    setBusyId(post.id);
    setError("");
    try {
      const response = await fetch(`/api/posts/${post.id}/schedule`, { method: "DELETE" });
      const body = await readApiResponse<{ error?: string }>(response);
      if (!response.ok) throw new Error(body.error || "Jadwal belum bisa dibatalkan.");
      setPosts((current) => current.filter((item) => item.id !== post.id));
      toast.success("Jadwal dibatalkan; status post diperbarui.");
    } catch (cancelError) {
      setError(
        cancelError instanceof Error ? cancelError.message : "Jadwal belum bisa dibatalkan.",
      );
      toast.error(
        cancelError instanceof Error ? cancelError.message : "Jadwal belum bisa dibatalkan.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="schedule-page">
      <header className="schedule-page-header">
        <div className="schedule-title-row">
          <div>
            <div className="section-kicker">ANTREAN KONTEN</div>
            <h1>Jadwal publikasi</h1>
            <p>Atur waktu tayang post dalam zona Asia/Jakarta.</p>
          </div>
          <button
            className="icon-button"
            onClick={() => void loadPosts()}
            aria-label="Muat ulang jadwal"
            disabled={loading}
          >
            <RefreshCw size={17} className={loading ? "spin-icon" : ""} />
          </button>
        </div>
      </header>
      <div
        className={`schedule-worker-note${worker?.online ? " worker-online" : " worker-offline"}`}
      >
        <Clock3 size={16} />
        <span>
          {worker?.online
            ? `Worker aktif · pemeriksaan terakhir ${worker.lastJob ? formatJakartaDateTime(worker.lastJob.startedAt) : "baru saja"} WIB.`
            : "Worker belum terlihat aktif. Jadwal tidak akan dipublikasikan sampai scheduler dijalankan setiap menit."}{" "}
          Waktu jadwal disimpan sebagai UTC.
        </span>
      </div>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <CircleAlert size={15} />
          <AlertDescription className="flex items-center gap-2">
            {error}
            <button className="font-semibold underline" onClick={() => void loadPosts()}>
              Coba lagi
            </button>
          </AlertDescription>
        </Alert>
      )}
      {loading ? (
        <div
          className="mt-4 rounded-xl border border-black/10 bg-white p-5"
          role="status"
          aria-label="Memuat antrean"
        >
          <div className="space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : posts.length ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-black/10 bg-white">
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[34%]">Post</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waktu tayang</TableHead>
                <TableHead>Percobaan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <ScheduledPostRow
                  key={post.id}
                  post={post}
                  onCancel={cancelSchedule}
                  onUpdate={updateSchedule}
                  busy={busyId === post.id}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          className="mt-4"
          icon={CalendarClock}
          title="Belum ada post terjadwal"
          description="Setujui draft dan pilih waktu tayang dari beranda."
          action={
            <button className="button-quiet" onClick={() => router.push("/")}>
              Lihat draft
            </button>
          }
        />
      )}
      <AlertDialog
        open={Boolean(cancelCandidate)}
        onOpenChange={(open) => !open && setCancelCandidate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan jadwal?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelCandidate
                ? `Jadwal untuk “${cancelCandidate.topic || "Post Threads"}” akan dibatalkan dan post kembali ke draft.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-vermillion hover:bg-red-700"
              onClick={() => {
                if (cancelCandidate) void confirmCancelSchedule(cancelCandidate);
                setCancelCandidate(null);
              }}
            >
              Batalkan jadwal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
