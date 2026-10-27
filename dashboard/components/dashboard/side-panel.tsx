import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SidePanel({ onCreate }: { onCreate: () => void }) {
  return (
    <aside className="grid gap-3">
      <Card className="border-0 bg-marigold p-4">
        <div className="flex items-center gap-2 text-[10px] font-medium tracking-[0.12em] text-charcoal/60">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-notion-blue">
            <Sparkles size={15} />
          </span>{" "}
          PEMANTIK HARI INI
        </div>
        <h3 className="mt-5 text-base font-semibold leading-6 text-charcoal">
          Hal kecil yang mengubah cara kerjamu
        </h3>
        <p className="mt-2 text-xs leading-5 text-charcoal/70">
          Bagikan satu kebiasaan atau tool sederhana yang ternyata memberi dampak besar.
        </p>
        <div className="my-4 h-px bg-charcoal/15" />
        <div className="flex items-center justify-between gap-2 text-xs text-charcoal/70">
          <span className="flex items-center gap-1">
            <MessageCircle size={14} /> Cocok untuk refleksi
          </span>
          <button
            className="inline-flex min-h-11 items-center gap-1 font-semibold text-charcoal"
            onClick={onCreate}
          >
            Pakai ide <ArrowRight size={14} />
          </button>
        </div>
      </Card>
      <Card className="relative min-h-32 overflow-hidden border-0 bg-midnight-ink p-5 text-white">
        <span className="absolute right-4 top-0 font-serif text-7xl leading-none text-sky-wash/20">
          “
        </span>
        <p className="relative max-w-[220px] font-serif text-lg leading-7 text-white">
          Mulai dari pengalaman nyata. Suara yang spesifik selalu lebih mudah diingat.
        </p>
        <span className="absolute bottom-4 text-[10px] tracking-[0.12em] text-white/60">
          CATATAN UNTUK MENULIS
        </span>
      </Card>
    </aside>
  );
}
