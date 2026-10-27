"use client";

import { useEffect, useRef } from "react";
import { Command, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type AppTopbarProps = {
  pageTitle: string;
  query: string;
  mobileNavOpen: boolean;
  onMenu: () => void;
  onQueryChange: (value: string) => void;
};

export function AppTopbar({
  pageTitle,
  query,
  mobileNavOpen,
  onMenu,
  onQueryChange,
}: AppTopbarProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
      <div className="flex items-center gap-3">
        <Button
          className="lg:hidden"
          variant="ghost"
          size="icon"
          onClick={onMenu}
          aria-label="Buka navigasi"
          aria-expanded={mobileNavOpen}
        >
          <Menu size={20} />
        </Button>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Workspace</span>
          <span className="text-slate-300">/</span>
          <strong className="text-slate-700">{pageTitle}</strong>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-5">
        <label className="flex h-10 w-10 items-center gap-2 rounded-lg bg-slate-50 px-3 text-slate-400 transition-all focus-within:w-44 focus-within:border focus-within:border-slate-200 sm:w-56">
          <Search size={16} />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Cari draft..."
            aria-label="Cari draft"
            className="min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
          />
          <kbd className="hidden items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400 sm:flex">
            <Command size={10} />K
          </kbd>
        </label>
        <span
          className="grid h-8 w-8 place-items-center rounded-full bg-stone-200 text-[11px] font-bold text-stone-600"
          aria-hidden="true"
        >
          R
        </span>
      </div>
    </header>
  );
}
