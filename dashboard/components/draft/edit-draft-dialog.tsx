"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Draft } from "@/components/draft/types";

type EditDraftDialogProps = {
  draft: Draft;
  onClose: () => void;
  onSave: (text: string) => Promise<void>;
};

export function EditDraftDialog({ draft, onClose, onSave }: EditDraftDialogProps) {
  const [text, setText] = useState(draft.text);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function submit() {
    setSaving(true);
    setError("");
    try {
      await onSave(text);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Draft belum bisa disimpan.");
      setSaving(false);
    }
  }

  function dismiss() {
    if (saving) return;
    if (text !== draft.text) {
      setConfirmOpen(true);
      return;
    }
    onClose();
  }

  return (
    <>
      <Dialog open onOpenChange={(nextOpen) => !nextOpen && dismiss()}>
        <DialogContent className="max-w-xl" aria-labelledby="edit-title">
          <DialogHeader>
            <p className="eyebrow-label">{draft.topic.toUpperCase()}</p>
            <DialogTitle id="edit-title">Edit draft</DialogTitle>
          </DialogHeader>
          <Label htmlFor="edit-draft">Teks post</Label>
          <Textarea
            id="edit-draft"
            autoFocus
            maxLength={500}
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="mt-2 min-h-44"
          />
          <div className="mt-1 text-right text-xs text-slate-400">{text.length} / 500 karakter</div>
          {error && (
            <p className="mt-2 text-xs text-rose-600" role="alert">
              {error}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={dismiss} disabled={saving}>
              Batal
            </Button>
            <Button onClick={submit} disabled={saving || !text.trim()}>
              {saving ? (
                "Menyimpan..."
              ) : (
                <>
                  <Check size={15} /> Simpan perubahan
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buang perubahan?</AlertDialogTitle>
            <AlertDialogDescription>
              Perubahan pada draft ini belum disimpan dan akan hilang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={onClose}>Buang perubahan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
