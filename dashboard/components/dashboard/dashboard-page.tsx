"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { SidePanel } from "@/components/dashboard/side-panel";
import type { ApiDraft, Draft, ProfileSummary } from "@/components/draft/types";
import { toDraft } from "@/components/draft/types";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { MetricsDashboard } from "@/components/metrics/metrics-dashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DashboardPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [draftError, setDraftError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadDrafts = fetch("/api/drafts", { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Draft belum bisa dimuat.");
      return body as { drafts: ApiDraft[] };
    });
    const loadProfile = fetch("/api/profile").then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Profile belum bisa dimuat.");
      return body as { profile: ProfileSummary | null };
    });

    void Promise.all([loadDrafts, loadProfile])
      .then(([draftBody, profileBody]) => {
        if (cancelled) return;
        setDrafts(draftBody.drafts.map(toDraft));
        setProfileSummary(profileBody.profile);
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setDraftError(
            error instanceof Error ? error.message : "Ringkasan dashboard belum bisa dimuat.",
          );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const reviewCount = drafts.filter((draft) => draft.status === "Perlu ditinjau").length;
  const aiCount = drafts.filter(
    (draft) => draft.status === "Perlu ditinjau" && draft.tone === "Dibuat AI",
  ).length;
  const openDrafts = () => router.push("/drafts");

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-8">
      <WelcomeHeader onCreate={openDrafts} />
      <OverviewCards draftCount={reviewCount} aiCount={aiCount} profile={profileSummary} />
      {draftError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle size={16} />
          <AlertDescription className="flex items-center gap-2">
            {draftError}
            <button className="font-semibold underline" onClick={() => window.location.reload()}>
              Coba lagi
            </button>
          </AlertDescription>
        </Alert>
      )}
      <div className="my-8">
        <MetricsDashboard />
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6">
          <span className="eyebrow-label">DRAFT</span>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            Siap meninjau draft?
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
            Buka ruang draft untuk mencari, mengedit, menjadwalkan, atau mempublikasikan kontenmu.
          </p>
          <button
            className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-notion-blue px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            onClick={openDrafts}
          >
            Buka semua draft
          </button>
        </div>
        <SidePanel onCreate={openDrafts} />
      </div>
      <footer className="mt-8 flex flex-wrap justify-between gap-2 border-t border-black/10 pt-4 text-xs text-stone">
        <span>
          Threads Studio <span className="px-1">·</span> Ruang kerjamu, ritmemu.
        </span>
        <span>Zona waktu WIB (UTC+7)</span>
      </footer>
    </main>
  );
}
