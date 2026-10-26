import { DashboardShell } from "@/components/dashboard-shell";
import { LoginForm } from "@/components/login-form";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!(await isAuthenticated())) return <LoginForm />;
  return <DashboardShell />;
}
