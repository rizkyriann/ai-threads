import { LoginForm } from "@/components/login-form";
import { ScheduleManager } from "@/components/schedule-manager";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  if (!(await isAuthenticated())) return <LoginForm />;
  return <ScheduleManager />;
}
