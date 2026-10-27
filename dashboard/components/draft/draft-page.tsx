"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppShell } from "@/components/layout/app-shell-context";
import { CreateDraftDialog } from "@/components/draft/create-draft-dialog";
import { DraftSection } from "@/components/draft/draft-section";
import { EditDraftDialog } from "@/components/draft/edit-draft-dialog";
import { ScheduleDraftDialog } from "@/components/draft/schedule-draft-dialog";
import type { ApiDraft, Draft } from "@/components/draft/types";
import { toDraft } from "@/components/draft/types";
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
import { Skeleton } from "@/components/ui/skeleton";
import { formatJakartaDateTime } from "@/lib/jakarta-time";

export function DraftPage() {
  const { query } = useAppShell();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [schedulingDraft, setSchedulingDraft] = useState<Draft | null>(null);
  const [publishCandidate, setPublishCandidate] = useState<Draft | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [threadsConnected, setThreadsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadDrafts = fetch("/api/drafts", { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Draft belum bisa dimuat.");
      return body as { drafts: ApiDraft[] };
    });
    const loadThreads = fetch("/api/threads", { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Status koneksi Threads belum bisa dimuat.");
      return body as { connected: boolean };
    });

    void Promise.all([loadDrafts, loadThreads])
      .then(([draftBody, threadsBody]) => {
        if (cancelled) return;
        setDrafts(draftBody.drafts.map(toDraft));
        setThreadsConnected(Boolean(threadsBody.connected));
      })
      .catch((loadError: unknown) => {
        if (!cancelled)
          setError(loadError instanceof Error ? loadError.message : "Draft belum bisa dimuat.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(idea: string, count: number) {
    const response = await fetch("/api/drafts/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, count }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Draft belum berhasil dibuat.");
    setDrafts((current) => [...body.drafts.map(toDraft), ...current]);
    setCreateOpen(false);
    toast.success(`${body.drafts.length} draft berhasil dibuat dan disimpan.`);
  }

  async function handleSave(text: string) {
    if (!editingDraft) return;
    const response = await fetch(`/api/drafts/${editingDraft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Draft belum bisa disimpan.");
    setDrafts((current) =>
      current.map((draft) => (draft.id === editingDraft.id ? toDraft(body.draft) : draft)),
    );
    setEditingDraft(null);
    toast.success("Perubahan draft tersimpan.");
  }

  async function handleRegenerate(draft: Draft) {
    setRegeneratingId(draft.id);
    try {
      const response = await fetch(`/api/drafts/${draft.id}/regenerate`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Draft belum berhasil diregenerasi.");
      setDrafts((current) =>
        current.map((item) => (item.id === draft.id ? toDraft(body.draft) : item)),
      );
      toast.success("Draft berhasil diregenerasi.");
    } catch (regenerateError) {
      toast.error(
        regenerateError instanceof Error
          ? regenerateError.message
          : "Draft belum berhasil diregenerasi.",
      );
    } finally {
      setRegeneratingId(null);
    }
  }

  async function publishDraft(draft: Draft) {
    setPublishingId(draft.id);
    try {
      const response = await fetch(`/api/posts/${draft.id}/publish`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Post belum berhasil dipublikasikan.");
      setDrafts((current) => current.filter((item) => item.id !== draft.id));
      toast.success(`Post berhasil dipublikasikan · ID ${body.threadsMediaId}`);
    } catch (publishError) {
      const message =
        publishError instanceof Error
          ? publishError.message
          : "Post belum berhasil dipublikasikan.";
      setDrafts((current) =>
        current.map((item) =>
          item.id === draft.id
            ? { ...item, status: "Gagal diterbitkan", errorMessage: message, updated: "Baru saja" }
            : item,
        ),
      );
      toast.error(message);
    } finally {
      setPublishingId(null);
    }
  }

  async function handleSchedule(scheduledAt: string) {
    if (!schedulingDraft) return;
    const response = await fetch(`/api/posts/${schedulingDraft.id}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Jadwal belum bisa disimpan.");
    setDrafts((current) => current.filter((draft) => draft.id !== schedulingDraft.id));
    setSchedulingDraft(null);
    toast.success(`Post dijadwalkan untuk ${formatJakartaDateTime(body.post.scheduledAt)} WIB.`);
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-8">
      <header className="mb-8">
        <span className="eyebrow-label">RUANG KERJA</span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Draft</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Tinjau, edit, dan siapkan draft Threads sebelum dipublikasikan.
        </p>
      </header>
      {error ? (
        <Alert variant="destructive">
          <AlertCircle size={16} />
          <AlertDescription className="flex items-center gap-2">
            {error}
            <button className="font-semibold underline" onClick={() => window.location.reload()}>
              Coba lagi
            </button>
          </AlertDescription>
        </Alert>
      ) : loading ? (
        <div
          className="rounded-xl border border-black/10 bg-white p-5"
          role="status"
          aria-label="Memuat draft"
        >
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      ) : (
        <DraftSection
          drafts={drafts}
          query={query}
          threadsConnected={threadsConnected}
          regeneratingId={regeneratingId}
          publishingId={publishingId}
          onEdit={setEditingDraft}
          onCreate={() => setCreateOpen(true)}
          onRegenerate={handleRegenerate}
          onPublish={setPublishCandidate}
          onSchedule={setSchedulingDraft}
        />
      )}
      <CreateDraftDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
      {editingDraft && (
        <EditDraftDialog
          draft={editingDraft}
          onClose={() => setEditingDraft(null)}
          onSave={handleSave}
        />
      )}
      {schedulingDraft && (
        <ScheduleDraftDialog
          draft={schedulingDraft}
          onClose={() => setSchedulingDraft(null)}
          onSave={handleSchedule}
        />
      )}
      <AlertDialog
        open={Boolean(publishCandidate)}
        onOpenChange={(open) => !open && setPublishCandidate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish post sekarang?</AlertDialogTitle>
            <AlertDialogDescription>
              Post ini akan diterbitkan ke akun Threads yang terhubung dan tidak lagi menjadi draft.
            </AlertDialogDescription>
            {publishCandidate && (
              <div className="max-h-36 overflow-y-auto rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                {publishCandidate.text}
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(publishingId)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={Boolean(publishingId)}
              onClick={() => {
                if (publishCandidate) void publishDraft(publishCandidate);
                setPublishCandidate(null);
              }}
            >
              Publish sekarang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
