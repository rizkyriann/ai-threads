import { Clock3, Hash, PenLine } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import type { ProfileSummary } from "@/components/draft/types";

type OverviewCardsProps = { draftCount: number; aiCount: number; profile: ProfileSummary | null };

export function OverviewCards({ draftCount, aiCount, profile }: OverviewCardsProps) {
  const aiRatio = draftCount ? Math.min((aiCount / draftCount) * 100, 100) : 0;
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Ringkasan aktivitas">
      <Card className="relative h-36 overflow-hidden p-4">
        <div className="flex items-center justify-between">
          <MetricIcon className="bg-violet-50 text-violet-600">
            <PenLine size={17} />
          </MetricIcon>
          <span className="eyebrow-label">RUANG KERJA</span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <strong className="text-2xl font-semibold tracking-tight text-slate-900">
            {draftCount.toString().padStart(2, "0")}
          </strong>
          <span className="text-xs text-slate-400">menunggu review</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Draft menunggu review</p>
        <div
          className="absolute inset-x-4 bottom-0 flex h-7 items-end gap-1 opacity-70"
          aria-hidden="true"
        >
          {Array.from({ length: 20 }, (_, index) => (
            <i
              key={index}
              className="flex-1 rounded-t-sm bg-indigo-100"
              style={{ height: `${20 + ((index * 23) % 75)}%` }}
            />
          ))}
        </div>
      </Card>
      <Card className="h-36 p-4">
        <div className="flex items-center justify-between">
          <MetricIcon className="bg-blue-50 text-blue-600">
            <Clock3 size={17} />
          </MetricIcon>
          <span className="eyebrow-label">MINGGU INI</span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <strong className="text-2xl font-semibold tracking-tight text-slate-900">
            {aiCount.toString().padStart(2, "0")}
          </strong>
          <span className="text-xs text-slate-400">dari {draftCount} draft</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Dibuat dengan AI</p>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100">
          <span
            className="block h-full rounded-full bg-indigo-400 transition-[width]"
            style={{ width: `${aiRatio}%` }}
          />
        </div>
      </Card>
      <Card className="flex h-36 flex-col overflow-hidden p-4 sm:col-span-2 xl:col-span-1">
        <div>
          <MetricIcon className="bg-emerald-50 text-emerald-600">
            <Hash size={17} />
          </MetricIcon>
        </div>
        <div className="mt-2 truncate text-base font-semibold leading-5 tracking-tight text-slate-700">
          {profile?.niche || "Content profile"}
        </div>
        <p className="mt-0 truncate text-xs leading-4 text-slate-500">
          {profile ? `Versi ${profile.version} · ${profile.language}` : "Profile belum diatur"}
        </p>
      </Card>
    </section>
  );
}

function MetricIcon({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={`grid h-8 w-8 place-items-center rounded-lg ${className}`}>{children}</span>
  );
}
