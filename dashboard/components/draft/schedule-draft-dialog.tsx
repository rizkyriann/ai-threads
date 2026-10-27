"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toJakartaDateTimeInput } from "@/lib/jakarta-time";
import type { Draft } from "@/components/draft/types";

type ScheduleDraftDialogProps = {
  draft: Draft;
  onClose: () => void;
  onSave: (scheduledAt: string) => Promise<void>;
};

export function ScheduleDraftDialog({ draft, onClose, onSave }: ScheduleDraftDialogProps) {
  const [scheduledAt, setScheduledAt] = useState(() =>
    toJakartaDateTimeInput(new Date(Date.now() + 60 * 60 * 1000)),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setSaving(true);
    setError("");
    try {
      await onSave(scheduledAt);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Jadwal belum bisa disimpan.");
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(nextOpen) => !nextOpen && !saving && onClose()}>
      <DialogContent aria-labelledby="schedule-title">
        <DialogHeader>
          <div className="mb-4 grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
            <CalendarClock size={18} />
          </div>
          <p className="eyebrow-label">JADWALKAN POST</p>
          <DialogTitle id="schedule-title">Pilih waktu tayang</DialogTitle>
          <DialogDescription className="max-h-24 overflow-y-auto rounded-md bg-slate-50 p-3 text-xs">
            {draft.text}
          </DialogDescription>
        </DialogHeader>
        <Label htmlFor="schedule-at">Tanggal dan waktu (WIB)</Label>
        <Input
          id="schedule-at"
          className="mt-2"
          type="datetime-local"
          value={scheduledAt}
          min={toJakartaDateTimeInput(new Date(Date.now() + 60_000))}
          onChange={(event) => setScheduledAt(event.target.value)}
        />
        <p className="mt-2 text-xs text-slate-400">
          Zona waktu Asia/Jakarta (UTC+7). Waktu disimpan dalam UTC.
        </p>
        {error && (
          <p className="mt-2 text-xs text-rose-600" role="alert">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button onClick={submit} disabled={saving || !scheduledAt}>
            {saving ? (
              "Menyimpan..."
            ) : (
              <>
                <CalendarClock size={15} /> Simpan jadwal
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
