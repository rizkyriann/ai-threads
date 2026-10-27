"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type CreateDraftDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (text: string, count: number) => Promise<void>;
};

export function CreateDraftDialog({ open, onClose, onCreate }: CreateDraftDialogProps) {
  const [idea, setIdea] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    try {
      await onCreate(idea.trim(), count);
      setIdea("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Draft belum berhasil dibuat.");
      setLoading(false);
    }
  }

  function dismiss() {
    if (loading) return;
    if (idea.trim()) {
      setConfirmOpen(true);
      return;
    }
    onClose();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && dismiss()}>
        <DialogContent aria-labelledby="create-title">
          <DialogHeader>
            <div className="mb-4 grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles size={18} />
            </div>
            <p className="eyebrow-label">MULAI DARI SEBUAH IDE</p>
            <DialogTitle id="create-title">Apa yang ingin kamu ceritakan?</DialogTitle>
            <DialogDescription>
              Tulis topik atau pemikiran singkat. Nanti kita kembangkan jadi draft dengan gaya
              tulisanmu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-idea">Ide atau topik</Label>
            <Textarea
              id="new-idea"
              autoFocus
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              placeholder="Contoh: hal yang kupelajari saat membangun side project..."
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 text-indigo-600">
              <Sparkles size={13} /> Profile aktif digunakan bila tersedia
            </span>
            <label className="flex items-center gap-2">
              Jumlah
              <select
                className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs"
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error && (
            <p className="mt-2 text-xs text-rose-600" role="alert">
              {error}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={dismiss} disabled={loading}>
              Batal
            </Button>
            <Button onClick={submit} disabled={!idea.trim() || loading}>
              {loading ? (
                "Sedang membuat..."
              ) : (
                <>
                  <Sparkles size={15} /> Buat draft <ArrowRight size={14} />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buang ide ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Ide yang belum dibuat menjadi draft akan hilang dari form.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIdea("");
                setConfirmOpen(false);
                onClose();
              }}
            >
              Buang ide
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
