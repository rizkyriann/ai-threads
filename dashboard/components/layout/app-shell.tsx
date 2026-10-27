"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { AppShellContext } from "@/components/layout/app-shell-context";
import { readApiResponse } from "@/lib/api-response";

const routes: Record<string, string> = {
  Draft: "/drafts",
  "Content profile": "/profile",
  "Koneksi Threads": "/settings/threads",
  Jadwal: "/schedule",
  Metrik: "/metrics",
};

function getActiveNav(pathname: string) {
  if (pathname === "/drafts") return "Draft";
  if (pathname === "/profile") return "Content profile";
  if (pathname === "/settings/threads") return "Koneksi Threads";
  if (pathname === "/schedule") return "Jadwal";
  if (pathname === "/metrics") return "Metrik";
  return "Beranda";
}

function getPageTitle(pathname: string) {
  if (pathname === "/drafts") return "Draft";
  if (pathname === "/profile") return "Content profile";
  if (pathname === "/settings/threads") return "Koneksi Threads";
  if (pathname === "/schedule") return "Jadwal publikasi";
  if (pathname === "/metrics") return "Performa konten";
  return "Beranda";
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftCount, setDraftCount] = useState(0);
  const activeNav = getActiveNav(pathname);
  const pageTitle = getPageTitle(pathname);
  const contextValue = useMemo(() => ({ query }), [query]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/drafts", { cache: "no-store" })
      .then((response) => readApiResponse<{ drafts?: Array<{ status: string }> }>(response))
      .then((body) => {
        if (!cancelled)
          setDraftCount(body.drafts?.filter((draft) => draft.status === "DRAFT").length ?? 0);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  function handleNavigate(label: string) {
    if (label === "Beranda") {
      if (pathname !== "/") router.push("/");
    } else if (routes[label]) {
      router.push(routes[label]);
    }
    setMobileNavOpen(false);
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <AppShellContext.Provider value={contextValue}>
      <AppSidebar
        active={activeNav}
        isOpen={mobileNavOpen}
        draftCount={draftCount}
        onNavigate={handleNavigate}
        onClose={() => setMobileNavOpen(false)}
        onLogout={handleLogout}
      />
      <div className="min-h-screen bg-slate-50 lg:pl-[256px]">
        <AppTopbar
          pageTitle={pageTitle}
          mobileNavOpen={mobileNavOpen}
          onMenu={() => setMobileNavOpen(true)}
          query={query}
          onQueryChange={setQuery}
        />
        <div>{children}</div>
      </div>
    </AppShellContext.Provider>
  );
}
