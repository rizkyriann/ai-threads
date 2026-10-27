import { CalendarClock, MoreHorizontal, Pencil, RefreshCw, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Draft } from "@/components/draft/types";

type DraftCardProps = {
  draft: Draft;
  onEdit: (draft: Draft) => void;
  onRegenerate: (draft: Draft) => void;
  onPublish: (draft: Draft) => void;
  onSchedule: (draft: Draft) => void;
  regenerating: boolean;
  publishing: boolean;
  threadsConnected: boolean;
};

export function DraftCard({
  draft,
  onEdit,
  onRegenerate,
  onPublish,
  onSchedule,
  regenerating,
  publishing,
  threadsConnected,
}: DraftCardProps) {
  const characterCount = draft.text.length;
  const badgeVariant =
    draft.status === "Perlu ditinjau"
      ? "warning"
      : draft.status === "Gagal diterbitkan"
        ? "danger"
        : "default";
  return (
    <Card className="p-4 transition-colors hover:border-black/20">
      <div className="flex items-center justify-between">
        <Badge variant={badgeVariant}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {draft.status}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-slate-400"
              aria-label={`Aksi draft ${draft.topic}`}
            >
              <MoreHorizontal size={17} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(draft)}>
              <Pencil size={14} /> Edit draft
            </DropdownMenuItem>
            {draft.status === "Perlu ditinjau" && draft.tone === "Dibuat AI" && (
              <DropdownMenuItem
                disabled={regenerating || publishing}
                onSelect={() => onRegenerate(draft)}
              >
                <RefreshCw size={14} /> {regenerating ? "Membuat..." : "Regenerate"}
              </DropdownMenuItem>
            )}
            {draft.status === "Perlu ditinjau" && threadsConnected && (
              <>
                <DropdownMenuItem disabled={publishing} onSelect={() => onSchedule(draft)}>
                  <CalendarClock size={14} /> Jadwalkan
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={publishing}
                  className="text-emerald-700 focus:text-emerald-700"
                  onSelect={() => onPublish(draft)}
                >
                  <Send size={14} /> Publish
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <button
        className="mt-3 block min-h-11 w-full text-left"
        onClick={() => onEdit(draft)}
        aria-label={`Edit draft tentang ${draft.topic}`}
      >
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{draft.text}</p>
      </button>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500">
          {draft.topic}
        </span>
        <span className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-400">
          {draft.tone}
        </span>
      </div>
      {draft.errorMessage && (
        <p className="mt-3 border-l-2 border-rose-300 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700">
          {draft.errorMessage}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">Diubah {draft.updated}</span>
        <span className={`text-xs ${characterCount > 450 ? "text-amber-600" : "text-slate-400"}`}>
          {characterCount}
          <span className="text-slate-300"> / 500</span>
        </span>
      </div>
    </Card>
  );
}
