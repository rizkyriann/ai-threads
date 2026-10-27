"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  CalendarDays,
  ChevronDown,
  FileText,
  Home,
  LogOut,
  MessageCircle,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/layout/logo-mark";
import { cn } from "@/lib/utils";

type NavItem = { label: string; icon: LucideIcon; disabled?: boolean };

const navItems: NavItem[] = [
  { label: "Beranda", icon: Home },
  { label: "Draft", icon: FileText },
  { label: "Jadwal", icon: CalendarDays },
  { label: "Disimpan", icon: Bookmark, disabled: true },
];

type AppSidebarProps = {
  active: string;
  isOpen: boolean;
  draftCount: number;
  onNavigate: (label: string) => void;
  onClose: () => void;
  onLogout: () => void;
};

export function AppSidebar({
  active,
  isOpen,
  draftCount,
  onNavigate,
  onClose,
  onLogout,
}: AppSidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={onClose}
          aria-label="Tutup navigasi"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[256px] -translate-x-full flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform lg:translate-x-0",
          isOpen && "translate-x-0",
        )}
      >
        <div className="flex items-center gap-2 px-2">
          <LogoMark />
          <strong className="text-sm tracking-tight text-slate-900">
            threads<span className="font-medium text-indigo-600">studio</span>
          </strong>
          <Button
            className="ml-auto lg:hidden"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Tutup navigasi"
          >
            <X size={18} />
          </Button>
        </div>

        <button
          className="mt-8 flex min-h-14 w-full items-center gap-3 rounded-lg border border-slate-200 px-3 text-left transition-colors hover:bg-slate-50"
          aria-label="Workspace personal"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-800 text-xs font-bold text-white">
            R
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <strong className="text-xs text-slate-800">Personal</strong>
            <span className="text-[11px] text-slate-400">Workspace</span>
          </span>
          <ChevronDown size={15} className="text-slate-400" />
        </button>

        <SidebarGroup label="MENU">
          {navItems.map(({ label, icon: Icon, disabled }) => (
            <SidebarButton
              key={label}
              active={active === label}
              disabled={disabled}
              ariaCurrent={active === label}
              onClick={() => !disabled && onNavigate(label)}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span className="flex-1">{label}</span>
              {label === "Draft" && (
                <span className="rounded-full border border-indigo-100 bg-white px-2 py-0.5 text-[10px] text-indigo-600">
                  {draftCount}
                </span>
              )}
              {disabled && (
                <span
                  className="h-1.5 w-1.5 rounded-full border border-slate-300"
                  aria-label="Segera"
                />
              )}
            </SidebarButton>
          ))}
        </SidebarGroup>

        <SidebarGroup label="PREFERENSI" className="mt-7">
          <SidebarButton
            active={active === "Content profile"}
            onClick={() => onNavigate("Content profile")}
          >
            <Settings2 size={17} strokeWidth={1.8} />
            <span>Content profile</span>
          </SidebarButton>
          <SidebarButton
            active={active === "Koneksi Threads"}
            onClick={() => onNavigate("Koneksi Threads")}
          >
            <MessageCircle size={17} strokeWidth={1.8} />
            <span>Koneksi Threads</span>
          </SidebarButton>
          <SidebarButton active={active === "Metrik"} onClick={() => onNavigate("Metrik")}>
            <BarChart3 size={17} strokeWidth={1.8} />
            <span>Metrik</span>
          </SidebarButton>
        </SidebarGroup>

        <div className="mt-auto pt-7">
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
            <div className="mb-2 grid h-7 w-7 place-items-center rounded-md bg-white text-indigo-600">
              <Sparkles size={14} />
            </div>
            <strong className="text-xs text-slate-800">Buat tulisan yang terasa kamu.</strong>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              Lengkapi content profile agar draft lebih personal.
            </p>
            <button
              className="mt-2 inline-flex min-h-11 items-center gap-1 text-[11px] font-semibold text-indigo-600"
              onClick={() => onNavigate("Content profile")}
            >
              Lengkapi profile <ArrowRight size={13} />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-slate-100 px-2 pt-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-stone-200 text-xs font-bold text-stone-600">
              R
            </span>
            <span className="flex flex-1 flex-col">
              <strong className="text-xs text-slate-800">Ruang pribadi</strong>
              <span className="text-[10px] text-slate-400">Pemilik workspace</span>
            </span>
            <button
              className="grid h-10 w-10 place-items-center rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              onClick={onLogout}
              aria-label="Keluar"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarGroup({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mt-7", className)}>
      <div className="mb-2 px-2 text-[10px] font-medium tracking-[0.14em] text-slate-400">
        {label}
      </div>
      <nav className="grid gap-1">{children}</nav>
    </div>
  );
}

function SidebarButton({
  active,
  disabled,
  children,
  onClick,
  ariaCurrent,
}: {
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick: () => void;
  ariaCurrent?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 text-left text-xs text-slate-500 transition-all duration-150 hover:-translate-y-px hover:bg-slate-50 hover:text-slate-900 disabled:cursor-default disabled:hover:translate-y-0 disabled:text-slate-300",
        active &&
          "bg-indigo-50 font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-600",
      )}
      disabled={disabled}
      onClick={onClick}
      aria-current={ariaCurrent ? "page" : undefined}
    >
      {children}
    </button>
  );
}
