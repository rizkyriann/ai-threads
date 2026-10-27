"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DraftCard } from "@/components/draft/draft-card";
import type { Draft } from "@/components/draft/types";
import { EmptyState } from "@/components/ui/empty-state";

type DraftSectionProps = {
  drafts: Draft[];
  query: string;
  threadsConnected: boolean;
  regeneratingId: string | null;
  publishingId: string | null;
  onEdit: (draft: Draft) => void;
  onCreate: () => void;
  onRegenerate: (draft: Draft) => void;
  onPublish: (draft: Draft) => void;
  onSchedule: (draft: Draft) => void;
};
const filters = ["Semua", "Perlu ditinjau", "Dibuat AI", "Gagal diterbitkan"] as const;

export function DraftSection({
  drafts,
  query,
  threadsConnected,
  regeneratingId,
  publishingId,
  onEdit,
  onCreate,
  onRegenerate,
  onPublish,
  onSchedule,
}: DraftSectionProps) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Semua");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const filteredDrafts = useMemo(
    () =>
      drafts
        .filter((draft) => {
          const matchesFilter =
            filter === "Semua" ||
            (filter === "Dibuat AI"
              ? draft.tone === filter
              : filter === "Gagal diterbitkan"
                ? draft.status === filter
                : draft.status === "Perlu ditinjau");
          return (
            matchesFilter &&
            `${draft.text} ${draft.topic} ${draft.tone}`
              .toLowerCase()
              .includes(query.trim().toLowerCase())
          );
        })
        .sort((a, b) =>
          sort === "newest"
            ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
        ),
    [drafts, filter, query, sort],
  );
  const reviewCount = drafts.filter((draft) => draft.status === "Perlu ditinjau").length;

  return (
    <section className="min-w-0" id="drafts">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <span className="eyebrow-label">RUANG KERJA</span>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900">
            Draft kamu{" "}
            <span className="grid h-6 min-w-6 place-items-center rounded-md bg-indigo-50 px-1 text-xs font-medium text-indigo-600">
              {drafts.length}
            </span>
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={onCreate}>
          <Plus size={15} /> Draft baru
        </Button>
      </div>
      <div className="mb-3 flex min-h-11 items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex h-full gap-4 overflow-x-auto" role="group" aria-label="Filter draft">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              className={`relative whitespace-nowrap text-xs ${filter === item ? "font-semibold text-slate-900 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-indigo-600" : "text-slate-400"}`}
              onClick={() => setFilter(item)}
            >
              {item}
              {item === "Perlu ditinjau" && (
                <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px]">
                  {reviewCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <label className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">
          <ArrowDownRight size={14} />
          <span className="sr-only">Urutkan draft</span>
          <select
            className="bg-transparent py-2 outline-none"
            value={sort}
            onChange={(event) => setSort(event.target.value as "newest" | "oldest")}
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
          <ChevronDown size={13} />
        </label>
      </div>
      {filteredDrafts.length ? (
        <div className="grid gap-3">
          {filteredDrafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onEdit={onEdit}
              onRegenerate={onRegenerate}
              onPublish={onPublish}
              onSchedule={onSchedule}
              regenerating={regeneratingId === draft.id}
              publishing={publishingId === draft.id}
              threadsConnected={threadsConnected}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Plus}
          title="Belum ada draft di sini"
          description="Coba pilih filter lain atau buat draft baru."
          action={
            <Button variant="outline" size="sm" onClick={onCreate}>
              Buat draft baru
            </Button>
          }
        />
      )}
    </section>
  );
}
