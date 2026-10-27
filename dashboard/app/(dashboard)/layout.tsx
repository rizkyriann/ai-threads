import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LoginForm } from "@/components/auth/login-form";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!(await isAuthenticated())) return <LoginForm />;
  return <AppShell>{children}</AppShell>;
}
