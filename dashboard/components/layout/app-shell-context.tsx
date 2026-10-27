"use client";

import { createContext, useContext } from "react";

type AppShellContextValue = { query: string };

export const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) throw new Error("useAppShell harus digunakan di dalam AppShell.");
  return context;
}
