import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="mb-7 flex items-start justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[10px] font-medium tracking-[0.12em] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ring-4 ring-emerald-50" /> RUANG
          KERJA PRIBADI
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-4xl">
          Selamat pagi, Rian<span className="text-indigo-600">.</span>
        </h1>
        <p className="mt-2 text-sm text-slate-500">Satu ide bagus bisa jadi awal percakapan.</p>
      </div>
      <Button onClick={onCreate}>
        <Plus size={17} strokeWidth={2.4} />
        <span className="hidden sm:inline">Buat draft</span>
        <span className="sm:hidden">Buat</span>
      </Button>
    </section>
  );
}
